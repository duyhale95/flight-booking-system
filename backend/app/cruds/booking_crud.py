import logging
from typing import Any, Optional

from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, func, select

from app.core.exceptions import (
    BookingError,
    BookingNotFoundError,
    BookingStatusError,
    UnauthorizedBookingAccessError,
)
from app.models import Booking, BookingStatus, User
from app.schemas import BookingCreate, BookingUpdate

logger = logging.getLogger(__name__)


def create(session: Session, booking_in: BookingCreate) -> Booking:
    """
    Create a new booking in the database.
    """
    logger.info(f"Creating new booking for user ID: {booking_in.user_id}")

    try:
        booking_db = Booking.model_validate(booking_in)

        session.add(booking_db)
        session.commit()
        session.refresh(booking_db)

        logger.info(f"Successfully created booking with ID: {booking_db.id}")
        return booking_db

    except IntegrityError as e:
        session.rollback()
        logger.error(f"Database integrity error during booking creation: {str(e)}")
        raise BookingError(500, f"Failed to create booking: {str(e)}") from e


def get_by_id(session: Session, booking_id: str) -> Booking:
    """
    Get booking by ID.
    """
    logger.debug(f"Getting booking by ID: {booking_id}")

    booking_db = session.get(Booking, booking_id)
    if not booking_db:
        logger.warning(f"Booking not found with ID: {booking_id}")
        raise BookingNotFoundError(booking_id=booking_id)
    return booking_db


def get_by_booking_number(session: Session, booking_number: str) -> Booking | None:
    """
    Get booking by booking number.
    """
    logger.debug(f"Getting booking by number: {booking_number}")

    query = select(Booking).where(Booking.booking_number == booking_number)
    return session.exec(query).first()


def get_bookings_by_user(
    session: Session,
    user_id: str,
    skip: int = 0,
    limit: int = 100,
    status: Optional[BookingStatus] = None,
) -> tuple[list[Booking], int]:
    """
    Get all bookings for a specific user.

    Returns:
        Tuple of (list of bookings, count)
    """
    logger.info(f"Getting bookings for user ID: {user_id}")

    query = select(Booking).where(Booking.user_id == user_id)

    if status:
        query = query.where(Booking.status == status)

    # Get total count
    count_stmt = select(func.count()).select_from(query.subquery())
    count = session.exec(count_stmt).one()

    # Apply pagination
    query = query.offset(skip).limit(limit)
    bookings = list(session.exec(query).all())

    logger.info(
        f"Found {count} bookings for user {user_id}, returning {len(bookings)} results"
    )
    return bookings, count


def get_all_bookings(
    session: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[BookingStatus] = None,
) -> tuple[list[Booking], int]:
    """
    Get all bookings with optional status filter.

    Returns:
        Tuple of (list of bookings, count)
    """
    logger.info("Getting all bookings")

    query = select(Booking)

    if status:
        query = query.where(Booking.status == status)

    # Get total count
    count_stmt = select(func.count()).select_from(query.subquery())
    count = session.exec(count_stmt).one()

    # Apply pagination
    query = query.offset(skip).limit(limit)
    bookings = list(session.exec(query).all())

    logger.info(f"Found {count} bookings, returning {len(bookings)} results")
    return bookings, count


def update(
    session: Session, booking_db: Booking, booking_in: dict[str, Any] | BookingUpdate
) -> Booking:
    """
    Update booking information.
    """
    logger.info(f"Updating booking with ID: {booking_db.id}")

    if isinstance(booking_in, BaseModel):
        booking_in = booking_in.model_dump(exclude_unset=True)

    try:
        new_data = BookingUpdate.model_validate(booking_in)
        booking_db.sqlmodel_update(new_data)

        session.add(booking_db)
        session.commit()
        session.refresh(booking_db)

        logger.info(f"Successfully updated booking with ID: {booking_db.id}")
        return booking_db

    except IntegrityError as e:
        session.rollback()
        logger.error(f"Database integrity error during booking update: {str(e)}")
        raise BookingError(500, f"Failed to update booking: {str(e)}") from e


def update_booking_status(
    session: Session,
    booking_db: Booking,
    new_status: BookingStatus,
) -> Booking:
    """
    Update booking status.
    """
    logger.info(f"Updating status for booking {booking_db.id} to {new_status}")

    # Add validation logic for status transitions
    current_status = booking_db.status

    # Prevent certain status transitions
    if (
        current_status == BookingStatus.CANCELLED
        and new_status != BookingStatus.CANCELLED
    ):
        logger.warning(f"Cannot change status from CANCELLED to {new_status}")
        raise BookingStatusError("Cannot change status from CANCELLED")

    try:
        booking_db.status = new_status
        session.add(booking_db)
        session.commit()
        session.refresh(booking_db)

        logger.info(
            f"Successfully updated status for booking {booking_db.id} to {new_status}"
        )
        return booking_db

    except Exception as e:
        session.rollback()
        logger.error(f"Error updating booking status: {str(e)}")
        raise BookingError(500, f"Failed to update booking status: {str(e)}") from e


def delete(session: Session, booking_db: Booking) -> None:
    """
    Delete a booking from the database.
    """
    logger.info(f"Deleting booking with ID: {booking_db.id}")

    try:
        session.delete(booking_db)
        session.commit()
        logger.info(f"Successfully deleted booking with ID: {booking_db.id}")

    except Exception as e:
        session.rollback()
        logger.error(f"Error deleting booking with ID {booking_db.id}: {str(e)}")
        raise BookingError(500, f"Failed to delete booking: {str(e)}") from e


def verify_user_can_access_booking(booking_db: Booking, current_user: User) -> None:
    """
    Verify that a user has permission to access a booking.

    Raises:
        UnauthorizedBookingAccessError: If the user does not own the booking
        and is not a superuser
    """
    if not current_user.is_superuser and booking_db.user_id != current_user.id:
        logger.warning(
            f"Unauthorized access attempt to booking {booking_db.id} "
            f"by user {current_user.id}"
        )
        raise UnauthorizedBookingAccessError()
