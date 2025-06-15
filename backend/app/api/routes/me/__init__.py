import logging
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.cruds import user_crud
from app.api.deps import CurrentUser, SessionDep
from app.common.exceptions import (
    AuthenticationError,
    UserError,
    handle_exception,
)
from app.core.security import verify_password
from app.domain.schemas import Message, UpdatePassword, UserPublic, UserUpdate

from . import bookings_me

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/me", tags=["me"])


@router.get("", response_model=UserPublic, tags=["users"])
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user information.
    """
    logger.info(f"User requested own profile: {current_user.id}")

    return current_user


@router.patch("", response_model=UserPublic, tags=["users"])
def update_user_me(
    session: SessionDep, current_user: CurrentUser, user_in: UserUpdate
) -> Any:
    """
    Update current user information.
    """
    try:
        logger.info(f"User updating own profile: {current_user.id}")

        user = user_crud.update(session, current_user, user_in)

        logger.info(f"User profile updated successfully: {current_user.id}")
        return user

    except UserError as e:
        logger.error(f"Error updating user profile: {str(e)}")
        raise handle_exception(e) from e


@router.patch("/password", response_model=Message, tags=["users"])
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

        user_crud.update(session, current_user, {"password": data.new_password})

        logger.info(f"Password changed successfully: {current_user.id}")
        return Message(msg="Password updated successfully")

    except UserError as e:
        logger.error(f"Error updating password: {str(e)}")
        raise handle_exception(e) from e


@router.delete("", response_model=Message, tags=["users"])
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


# Include other routes
router.include_router(bookings_me.router)
