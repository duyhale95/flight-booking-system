import logging
from typing import Any, Optional

from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, func, select

from app.core.exceptions import (
    AuthenticationError,
    InactiveUserError,
    UserAlreadyExistsError,
    UserError,
    UserNotFoundError,
)
from app.core.security import get_password_hash, verify_password
from app.models import User
from app.schemas import UserCreate

logger = logging.getLogger(__name__)


def create(*, session: Session, user_in: UserCreate) -> User:
    """
    Create a new user in the database.
    """
    logger.info(f"Creating new user with email: {user_in.email}")

    # Check if user already exists
    existing_user = get_by_email(session=session, email=user_in.email)
    if existing_user:
        logger.warning(f"Attempt to create user with existing email: {user_in.email}")
        raise UserAlreadyExistsError(user_in.email)

    try:
        extra = {"hashed_password": get_password_hash(user_in.password)}
        user_db = User.model_validate(user_in, update=extra)

        session.add(user_db)
        session.commit()
        session.refresh(user_db)

        logger.info(f"Successfully created user with ID: {user_db.id}")
        return user_db

    except IntegrityError as e:
        session.rollback()
        logger.error(f"Database integrity error during user creation: {str(e)}")
        raise UserError(500, f"Failed to create user: {str(e)}") from e


def update(
    *, session: Session, user_db: User, new_data: dict[str, Any] | BaseModel
) -> User:
    """
    Update user information.
    """
    logger.info(f"Updating user with ID: {user_db.id}")

    if isinstance(new_data, BaseModel):
        new_data = new_data.model_dump(exclude_unset=True)

    # Handle password update
    if new_data.get("password"):
        new_data["hashed_password"] = get_password_hash(new_data["password"])

    # Check email uniqueness
    if new_data.get("email") and new_data["email"] != user_db.email:
        new_email = new_data["email"]
        existing_user = get_by_email(session=session, email=new_email)
        if existing_user:
            logger.warning(f"Attempt to update user to existing email: {new_email}")
            raise UserAlreadyExistsError(new_email)

    try:
        user_db.sqlmodel_update(new_data)
        session.add(user_db)
        session.commit()
        session.refresh(user_db)

        logger.info(f"Successfully updated user with ID: {user_db.id}")
        return user_db

    except IntegrityError as e:
        session.rollback()
        logger.error(f"Database integrity error during user update: {str(e)}")
        raise UserError(500, f"Failed to update user: {str(e)}") from e


def delete(*, session: Session, user_db: User) -> None:
    """
    Delete a user from the database.
    """
    logger.info(f"Deleting user with ID: {user_db.id}")

    try:
        session.delete(user_db)
        session.commit()
        logger.info(f"Successfully deleted user with ID: {user_db.id}")

    except Exception as e:
        session.rollback()
        logger.error(f"Error deleting user with ID {user_db.id}: {str(e)}")
        raise UserError(500, f"Failed to delete user: {str(e)}") from e


def get_by_email(*, session: Session, email: str) -> User | None:
    """
    Get user by email.
    """
    logger.debug(f"Getting user by email: {email}")

    return session.exec(select(User).where(User.email == email)).first()


def get_by_id(*, session: Session, user_id: str) -> User:
    """
    Get user by ID.
    """
    logger.debug(f"Getting user by ID: {user_id}")

    user_db = session.get(User, user_id)
    if not user_db:
        logger.warning(f"User not found with ID: {user_id}")
        raise UserNotFoundError(user_id=user_id)
    return user_db


def search_users(
    *,
    session: Session,
    email: Optional[str] = None,
    name: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_superuser: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
) -> tuple[list[User], int]:
    """
    Search for users with various filters.

    Returns:
        Tuple of (list of users, count)
    """
    logger.info("Searching users with filters")

    # Create base query
    query = select(User)
    if email:
        query = query.where(User.email == email)
    if name:
        query = query.where(User.name == name)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    if is_superuser is not None:
        query = query.where(User.is_superuser == is_superuser)

    # Count total matching users
    count_stmt = select(func.count()).select_from(query.subquery())
    total = session.exec(count_stmt).one()

    # Get paginated results
    query = query.offset(skip).limit(limit)
    users = list(session.exec(query).all())

    logger.info(f"Found {total} users, returning {len(users)} results")
    return users, total


def authenticate(*, session: Session, email: str, password: str) -> User:
    """
    Authenticate a user with email and password.
    """
    logger.info(f"Authentication user: {email}")

    user_db = get_by_email(session=session, email=email)
    if not user_db:
        logger.warning(f"Authentication failed: User not found: {email}")
        raise AuthenticationError("Invalid email or password")

    if not verify_password(password, user_db.hashed_password):
        logger.warning(f"Authentication failed: Invalid password for user: {email}")
        raise AuthenticationError("Invalid email or password")

    if not user_db.is_active:
        logger.warning(f"Authentication failed: Inactive user: {email}")
        raise InactiveUserError()

    logger.info(f"User authenticated successfully: {email}")
    return user_db
