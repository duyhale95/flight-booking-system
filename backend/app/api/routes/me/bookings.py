import logging
from typing import Any, Optional

from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.core.exceptions import (
    BookingError,
    UnauthorizedBookingAccessError,
    handle_exception,
)
from app.cruds import ViewFilter, booking_crud
from app.models.booking import BookingStatus
from app.schemas import BookingCreate, BookingPublic, BookingsPublic, Message

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("", response_model=BookingsPublic)
def read_user_bookings(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 10,
    status: Optional[BookingStatus] = None,
    view_filter: ViewFilter = ViewFilter.ACTIVE,
) -> Any:
    """
    Retrieve bookings for the current user.
    """
    logger.info(f"Retrieving bookings for user ID: {current_user.id}")

    bookings, count = booking_crud.get_bookings_by_user(
        session, current_user.id, skip, limit, status, view_filter
    )
    return {"data": bookings, "count": count}


@router.post("", response_model=BookingPublic)
def create_user_booking(
    session: SessionDep, current_user: CurrentUser, booking_in: BookingCreate
) -> Any:
    """
    Create a booking for the current user.
    """
    # TODO: Create a booking -> Create passengers -> Create tickets
    logger.info(f"Creating booking for user ID: {current_user.id}")

    try:
        if booking_in.user_id != current_user.id:
            logger.warning(
                f"User {current_user.id} is not authorized to create booking "
                f"for user {booking_in.user_id}"
            )
            raise UnauthorizedBookingAccessError()

        booking_db = booking_crud.create(session, booking_in)

        logger.info(f"Booking created successfully: {booking_db.id}")
        return booking_db

    except BookingError as e:
        logger.error(f"Error creating booking: {str(e)}")
        raise handle_exception(e) from e


@router.get("/{booking_id}", response_model=BookingPublic)
def read_user_booking(
    session: SessionDep, current_user: CurrentUser, booking_id: str
) -> Any:
    """
    Retrieve a booking by ID for the current user.
    """
    logger.info(
        f"Retrieving booking with ID: {booking_id} for user ID: {current_user.id}"
    )

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)

        # Check permissions
        booking_crud.verify_user_can_access_booking(booking_db, current_user)

        logger.info(f"Booking retrieved successfully: {booking_db.id}")
        return booking_db

    except BookingError as e:
        logger.error(f"Error retrieving booking: {str(e)}")
        raise handle_exception(e) from e


@router.delete("/{booking_id}", response_model=Message)
def delete_user_booking(
    session: SessionDep, current_user: CurrentUser, booking_id: str
) -> Any:
    """
    Soft delete a booking for the current user.
    """
    logger.info(
        f"Deleting booking with ID: {booking_id} for user ID: {current_user.id}"
    )

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)

        # Check permissions
        booking_crud.verify_user_can_access_booking(booking_db, current_user)

        booking_crud.delete(session, booking_db)

        logger.info(f"Booking deleted successfully: {booking_db.id}")
        return Message(msg="Booking deleted successfully")

    except BookingError as e:
        logger.error(f"Error deleting booking: {str(e)}")
        raise handle_exception(e) from e


@router.post("/{booking_id}/restore", response_model=BookingPublic)
def restore_user_booking(
    session: SessionDep, current_user: CurrentUser, booking_id: str
) -> Any:
    """
    Restore a soft deleted booking for the current user.
    """
    logger.info(f"Restoring booking with ID: {booking_id}")

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)

        # Check permissions
        booking_crud.verify_user_can_access_booking(booking_db, current_user)

        booking_db = booking_crud.restore(session, booking_db)

        logger.info(f"Booking restored successfully: {booking_db.id}")
        return booking_db

    except BookingError as e:
        logger.error(f"Error restoring booking: {str(e)}")
        raise handle_exception(e) from e


@router.post("/{booking_id}/cancel", response_model=BookingPublic)
def cancel_user_booking(
    session: SessionDep, current_user: CurrentUser, booking_id: str
) -> Any:
    """
    Cancel a booking for the current user.
    """
    logger.info(
        f"Cancelling booking with ID: {booking_id} for user ID: {current_user.id}"
    )

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)

        # Check permissions
        booking_crud.verify_user_can_access_booking(booking_db, current_user)

        if booking_db.status == BookingStatus.CANCELLED:
            raise BookingError(
                400, f"Booking is already cancelled with ID: {booking_id}"
            )

        booking_db = booking_crud.update_booking_status(
            session, booking_db, BookingStatus.CANCELLED
        )

        logger.info(f"Booking cancelled successfully: {booking_db.id}")
        return booking_db

    except BookingError as e:
        logger.error(f"Error cancelling booking: {str(e)}")
        raise handle_exception(e) from e
