import logging
from typing import Any

from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, func, select

from app.common.exceptions import (
    PassengerError,
    PassengerNotFoundError,
    UnauthorizedPassengerAccessError,
)
from app.domain.models import Booking, Passenger, User
from app.domain.schemas import PassengerCreate, PassengerUpdate

logger = logging.getLogger(__name__)


def create(session: Session, passenger_in: PassengerCreate) -> Passenger:
    """
    Create a new passenger in the database.
    """
    logger.info(f"Creating new passenger for booking ID: {passenger_in.booking_id}")

    try:
        passenger_db = Passenger.model_validate(passenger_in)

        session.add(passenger_db)
        session.commit()
        session.refresh(passenger_db)

        logger.info(f"Successfully created passenger with ID: {passenger_db.id}")
        return passenger_db

    except IntegrityError as e:
        session.rollback()
        logger.error(f"Database integrity error during passenger creation: {str(e)}")
        raise PassengerError(500, f"Failed to create passenger: {str(e)}") from e


def get_by_id(session: Session, passenger_id: str) -> Passenger:
    """
    Get passenger by ID.
    """
    logger.debug(f"Getting passenger by ID: {passenger_id}")

    passenger_db = session.get(Passenger, passenger_id)
    if not passenger_db:
        logger.warning(f"Passenger not found with ID: {passenger_id}")
        raise PassengerNotFoundError(passenger_id=passenger_id)
    return passenger_db


def get_passengers_by_booking(
    session: Session,
    booking_id: str,
    skip: int = 0,
    limit: int = 100,
) -> tuple[list[Passenger], int]:
    """
    Get all passengers for a specific booking.

    Returns:
        Tuple of (list of passengers, count)
    """
    logger.info(f"Getting passengers for booking ID: {booking_id}")

    query = select(Passenger).where(Passenger.booking_id == booking_id)

    # Get total count
    count_stmt = select(func.count()).select_from(query.subquery())
    count = session.exec(count_stmt).one()

    # Apply pagination
    query = query.offset(skip).limit(limit)
    passengers = list(session.exec(query).all())

    logger.info(
        f"Found {count} passengers for booking {booking_id}, "
        f"returning {len(passengers)} results"
    )
    return passengers, count


def get_all_passengers(
    session: Session,
    skip: int = 0,
    limit: int = 100,
) -> tuple[list[Passenger], int]:
    """
    Get all passengers with optional filters.

    Returns:
        Tuple of (list of passengers, count)
    """
    logger.info("Getting all passengers")

    query = select(Passenger)

    # Get total count
    count_stmt = select(func.count()).select_from(query.subquery())
    count = session.exec(count_stmt).one()

    # Apply pagination
    query = query.offset(skip).limit(limit)
    passengers = list(session.exec(query).all())

    logger.info(f"Found {count} passengers, returning {len(passengers)} results")
    return passengers, count


def update(
    session: Session,
    passenger_db: Passenger,
    passenger_in: dict[str, Any] | PassengerUpdate,
) -> Passenger:
    """
    Update passenger information.
    """
    logger.info(f"Updating passenger with ID: {passenger_db.id}")

    if isinstance(passenger_in, BaseModel):
        passenger_in = passenger_in.model_dump(exclude_unset=True)

    try:
        passenger_db.sqlmodel_update(passenger_in)

        session.add(passenger_db)
        session.commit()
        session.refresh(passenger_db)

        logger.info(f"Successfully updated passenger with ID: {passenger_db.id}")
        return passenger_db

    except IntegrityError as e:
        session.rollback()
        logger.error(f"Database integrity error during passenger update: {str(e)}")
        raise PassengerError(500, f"Failed to update passenger: {str(e)}") from e


def delete(session: Session, passenger_db: Passenger) -> None:
    """
    Delete a passenger from the database.
    """
    logger.info(f"Deleting passenger with ID: {passenger_db.id}")

    try:
        session.delete(passenger_db)
        session.commit()
        logger.info(f"Successfully deleted passenger with ID: {passenger_db.id}")

    except Exception as e:
        session.rollback()
        logger.error(f"Error deleting passenger with ID {passenger_db.id}: {str(e)}")
        raise PassengerError(500, f"Failed to delete passenger: {str(e)}") from e


def verify_user_can_access_passenger(
    session: Session, passenger_db: Passenger, current_user: User
) -> None:
    """
    Verify that a user has permission to access a passenger.

    Raises:
        UnauthorizedPassengerAccessError: If the user doesn't own the booking
        associated with the passenger and isn't a superuser
    """
    if current_user.is_superuser:
        return

    booking = session.get(Booking, passenger_db.booking_id)
    if not booking or booking.user_id != current_user.id:
        logger.warning(
            f"Unauthorized access attempt to passenger {passenger_db.id} "
            f"by user {current_user.id}"
        )
        raise UnauthorizedPassengerAccessError()
