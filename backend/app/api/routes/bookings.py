import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends

from app.api.deps import SessionDep, get_current_superuser
from app.core.exceptions import BookingError, UserError, handle_exception
from app.cruds import ViewFilter, booking_crud
from app.models.booking import BookingStatus
from app.schemas import BookingPublic, BookingsPublic, BookingStatusUpdate, Message

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get(
    "",
    dependencies=[Depends(get_current_superuser)],
    response_model=BookingsPublic,
)
def read_bookings(
    session: SessionDep,
    skip: int = 0,
    limit: int = 10,
    status: Optional[BookingStatus] = None,
    view_filter: ViewFilter = ViewFilter.ACTIVE,
) -> Any:
    """
    Retrieve bookings (admin only).
    """
    logger.info("Retrieving bookings with filters")

    bookings, count = booking_crud.get_all_bookings(
        session, skip, limit, status, view_filter
    )
    return {"data": bookings, "count": count}


@router.get(
    "/{booking_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=BookingPublic,
)
def read_booking(session: SessionDep, booking_id: str) -> Any:
    """
    Retrieve a booking by ID (admin only).
    """
    logger.info(f"Retrieving booking with ID: {booking_id}")

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)

        logger.info(f"Booking retrieved successfully: {booking_db.id}")
        return booking_db

    except BookingError as e:
        logger.error(f"Error retrieving booking: {str(e)}")
        raise handle_exception(e) from e


@router.delete(
    "/{booking_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=Message,
)
def delete_booking(
    session: SessionDep, booking_id: str, hard_delete: bool = False
) -> Any:
    """
    Delete a booking (admin only).
    """
    logger.info(f"Deleting booking with ID: {booking_id}")

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)

        if hard_delete:
            booking_crud.hard_delete(session, booking_db)
        else:
            booking_crud.delete(session, booking_db)

        logger.info(f"Booking deleted successfully: {booking_id}")
        return Message(msg="Booking deleted successfully")

    except BookingError as e:
        logger.error(f"Error deleting booking: {str(e)}")
        raise handle_exception(e) from e


@router.post(
    "/{booking_id}/restore",
    dependencies=[Depends(get_current_superuser)],
    response_model=BookingPublic,
)
def restore_booking(session: SessionDep, booking_id: str) -> Any:
    """
    Restore a soft deleted booking (admin only).
    """
    logger.info(f"Restoring booking with ID: {booking_id}")

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)
        booking_db = booking_crud.restore(session, booking_db)

        logger.info(f"Booking restored successfully: {booking_db.id}")
        return booking_db

    except (BookingError, UserError) as e:
        logger.error(f"Error restoring booking: {str(e)}")
        raise handle_exception(e) from e


@router.patch(
    "/{booking_id}/status",
    dependencies=[Depends(get_current_superuser)],
    response_model=BookingPublic,
)
def update_booking_status(
    session: SessionDep, booking_id: str, booking_in: BookingStatusUpdate
) -> Any:
    """
    Update booking status (admin only).
    """
    logger.info(f"Updating booking status with ID: {booking_id}")

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)

        booking_db = booking_crud.update(session, booking_db, booking_in)

        logger.info(f"Booking status updated successfully: {booking_db.id}")
        return booking_db

    except BookingError as e:
        logger.error(f"Error updating booking status: {str(e)}")
        raise handle_exception(e) from e
