import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import CurrentUser, SessionDep, get_current_superuser
from app.core.config import settings
from app.core.exceptions import (
    AuthenticationError,
    UserAlreadyExistsError,
    UserError,
    UserNotFoundError,
    handle_exception,
)
from app.core.security import verify_password
from app.cruds import user_crud
from app.schemas import (
    Message,
    UpdatePassword,
    UserPublic,
    UsersPublic,
    UserUpdate,
    UserUpdateStatus,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "",
    dependencies=[Depends(get_current_superuser)],
    response_model=UsersPublic,
)
def read_users(
    session: SessionDep,
    skip: int = 0,
    limit: int = 10,
    email: Optional[str] = None,
    name: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> Any:
    """
    Retrieve users with optional filtering.
    """
    logger.info(f"Retrieving users list with filters (skip={skip}, limit={limit})")

    users, count = user_crud.search_users(
        session=session,
        email=email,
        name=name,
        is_active=is_active,
        skip=skip,
        limit=limit,
    )
    return {"data": users, "count": count}


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user information.
    """
    logger.info(f"User requested own profile: {current_user.id}")

    return current_user


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    session: SessionDep, current_user: CurrentUser, user_in: UserUpdate
) -> Any:
    """
    Update current user information.
    """
    try:
        logger.info(f"User updating own profile: {current_user.id}")

        user = user_crud.update(session=session, user_db=current_user, new_data=user_in)

        logger.info(f"User profile updated successfully: {current_user.id}")
        return user

    except (UserAlreadyExistsError, UserError) as e:
        logger.error(f"Error updating user profile: {str(e)}")
        raise handle_exception(e) from e


@router.patch("/me/password", response_model=Message)
def update_password_me(
    session: SessionDep, current_user: CurrentUser, data: UpdatePassword
) -> Any:
    """
    Update current user password.
    """
    try:
        logger.info(f"Password change requested: {current_user.id}")

        if not verify_password(data.current_password, current_user.hashed_password):
            logger.warning(
                "Password change failed - "
                f"incorrect current password: {current_user.id}"
            )
            raise AuthenticationError("Incorrect password")

        if data.current_password == data.new_password:
            logger.warning(
                "Password change failed - "
                f"new password same as current: {current_user.id}"
            )
            raise UserError(404, "New password must differ from the current password")

        user_crud.update(
            session=session,
            user_db=current_user,
            new_data={"password": data.new_password},
        )

        logger.info(f"Password changed successfully: {current_user.id}")
        return Message(msg="Password updated successfully")

    except (AuthenticationError, UserError, UserAlreadyExistsError) as e:
        logger.error(f"Error updating password: {str(e)}")
        raise handle_exception(e) from e


@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete current user account.
    """
    logger.info(f"User requesting account deletion: {current_user.id}")

    if current_user.is_superuser:
        logger.warning(
            "Account deletion denied - "
            f"superuser attempting to delete own account: {current_user.id}"
        )
        raise HTTPException(400, "Superusers are not allowed to delete themselves")

    try:
        user_crud.delete(session=session, user_db=current_user)

        logger.info(f"User account deleted successfully: {current_user.id}")
        return Message(msg="User deleted successfully")

    except UserError as e:
        logger.error(f"Error deleting user account: {str(e)}")
        raise handle_exception(e) from e


@router.get(
    "/{user_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=UserPublic,
)
def read_user(session: SessionDep, user_id: str) -> Any:
    """
    Get user by ID (admin only).
    """
    logger.info(f"Admin retrieving user details: {user_id}")
    try:
        return user_crud.get_by_id(session=session, user_id=user_id)
    except UserNotFoundError as e:
        raise handle_exception(e) from e


@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=UserPublic,
)
def update_user_status(
    session: SessionDep, status_in: UserUpdateStatus, user_id: str
) -> Any:
    """
    Update user status (admin only).
    """
    try:
        logger.info(f"Admin updating user status: {user_id}")

        user_db = user_crud.get_by_id(session=session, user_id=user_id)

        if user_db.email == settings.FIRST_SUPERUSER:
            logger.warning(
                f"Status update denied - attempt to update first superuser: {user_id}"
            )
            raise UserError(403, "Cannot update the first superuser")

        user = user_crud.update(session=session, user_db=user_db, new_data=status_in)

        logger.info(f"User status updated successfully: {user_id}")
        return user

    except (UserNotFoundError, UserError) as e:
        logger.error(f"Error updating user status: {str(e)}")
        raise handle_exception(e) from e


@router.delete(
    "/{user_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=Message,
)
def delete_user(session: SessionDep, user_id: str) -> Any:
    """
    Delete a user account (admin only).
    """
    try:
        logger.info(f"Admin attempting to delete user: {user_id}")

        user_db = user_crud.get_by_id(session=session, user_id=user_id)

        if user_db.email == settings.FIRST_SUPERUSER:
            logger.warning(
                f"Deletion denied - attempt to delete first superuser: {user_id}"
            )
            raise UserError(403, "Cannot delete the first superuser")

        user_crud.delete(session=session, user_db=user_db)
        logger.info(f"User deleted successfully by admin: {user_id}")
        return Message(msg="User deleted successfully")

    except (UserNotFoundError, UserError) as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise handle_exception(e) from e
