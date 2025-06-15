import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends

from app.api.deps import SessionDep, get_current_superuser
from app.core.config import settings
from app.core.exceptions import UserError, handle_exception
from app.cruds import user_crud
from app.domain.schemas import Message, UserPublic, UsersPublic, UserUpdateStatus

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
    is_superuser: Optional[bool] = None,
) -> Any:
    """
    Retrieve users with optional filtering (admin only).
    """
    logger.info(f"Retrieving users list with filters (skip={skip}, limit={limit})")

    users, count = user_crud.search_users(
        session, email, name, is_active, is_superuser, skip, limit
    )
    return {"data": users, "count": count}


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
        return user_crud.get_by_id(session, user_id)

    except UserError as e:
        logger.error(f"Error retrieving user: {str(e)}")
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

        user_db = user_crud.get_by_id(session, user_id)

        if user_db.email == settings.FIRST_SUPERUSER:
            logger.warning(
                f"Status update denied - attempt to update first superuser: {user_id}"
            )
            raise UserError(403, "Cannot update the first superuser")

        user = user_crud.update(session, user_db, status_in)

        logger.info(f"User status updated successfully: {user_id}")
        return user

    except UserError as e:
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

        user_db = user_crud.get_by_id(session, user_id)

        if user_db.email == settings.FIRST_SUPERUSER:
            logger.warning(
                f"Deletion denied - attempt to delete first superuser: {user_id}"
            )
            raise UserError(403, "Cannot delete the first superuser")

        user_crud.delete(session, user_db)
        logger.info(f"User deleted successfully by admin: {user_id}")
        return Message(msg="User deleted successfully")

    except UserError as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise handle_exception(e) from e
