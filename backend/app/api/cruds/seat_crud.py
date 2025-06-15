import logging
from typing import Any, Optional

from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, func, select

from app.common.exceptions import (
    FlightNotFoundError,
    SeatAlreadyExistsError,
    SeatError,
    SeatNotFoundError,
)
from app.domain.models import Flight, Seat
from app.domain.schemas import SeatCreate, SeatUpdate

logger = logging.getLogger(__name__)


def create(session: Session, seat_in: SeatCreate) -> Seat:
    """
    Create a new seat in the database.
    """
    logger.info(
        f"Creating new seat {seat_in.seat_number} for flight ID: {seat_in.flight_id}"
    )

    # Check if flight exists
    flight = session.get(Flight, seat_in.flight_id)
    if not flight:
        logger.warning(f"Flight not found with ID: {seat_in.flight_id}")
        raise FlightNotFoundError(flight_id=seat_in.flight_id)

    # Check if seat already exists
    query = select(Seat).where(
        Seat.flight_id == seat_in.flight_id,
        Seat.seat_number == seat_in.seat_number,
    )
    existing_seat = session.exec(query).first()

    if existing_seat:
        logger.warning(
            f"Seat {seat_in.seat_number} already exists for flight {seat_in.flight_id}"
        )
        raise SeatAlreadyExistsError(
            seat_number=seat_in.seat_number,
            flight_id=seat_in.flight_id,
        )

    try:
        seat_db = Seat.model_validate(seat_in)

        session.add(seat_db)
        session.commit()
        session.refresh(seat_db)

        logger.info(f"Successfully created seat with ID: {seat_db.id}")
        return seat_db

    except IntegrityError as e:
        session.rollback()
        logger.error(f"Database integrity error during seat creation: {str(e)}")
        raise SeatError(500, f"Failed to create seat: {str(e)}") from e


def get_by_id(session: Session, seat_id: str) -> Seat:
    """
    Get seat by ID.
    """
    logger.debug(f"Getting seat by ID: {seat_id}")

    seat_db = session.get(Seat, seat_id)
    if not seat_db:
        logger.warning(f"Seat not found with ID: {seat_id}")
        raise SeatNotFoundError(seat_id=seat_id)
    return seat_db


def get_by_seat_number(
    session: Session, flight_id: str, seat_number: str
) -> Seat | None:
    """
    Get seat by seat number for a specific flight.
    """
    logger.debug(f"Getting seat {seat_number} for flight {flight_id}")

    query = select(Seat).where(
        Seat.flight_id == flight_id,
        Seat.seat_number == seat_number,
    )
    return session.exec(query).first()


def get_seats_by_flight(
    session: Session,
    flight_id: str,
    skip: int = 0,
    limit: int = 100,
    available_only: bool = False,
) -> tuple[list[Seat], int]:
    """
    Get all seats for a specific flight.

    Returns:
        Tuple of (list of seats, count)
    """
    logger.info(f"Getting seats for flight ID: {flight_id}")

    query = select(Seat).where(Seat.flight_id == flight_id)

    if available_only:
        query = query.where(Seat.is_available == True)

    # Get total count
    count_stmt = select(func.count()).select_from(query.subquery())
    count = session.exec(count_stmt).one()

    # Apply pagination
    query = query.offset(skip).limit(limit)
    seats = list(session.exec(query).all())

    logger.info(
        f"Found {count} seats for flight {flight_id}, returning {len(seats)} results"
    )
    return seats, count


def get_all_seats(
    session: Session,
    skip: int = 0,
    limit: int = 100,
    available_only: bool = False,
) -> tuple[list[Seat], int]:
    """
    Get all seats with optional filters.

    Returns:
        Tuple of (list of seats, count)
    """
    logger.info("Getting all seats")

    query = select(Seat)

    if available_only:
        query = query.where(Seat.is_available == True)

    # Get total count
    count_stmt = select(func.count()).select_from(query.subquery())
    count = session.exec(count_stmt).one()

    # Apply pagination
    query = query.offset(skip).limit(limit)
    seats = list(session.exec(query).all())

    logger.info(f"Found {count} seats, returning {len(seats)} results")
    return seats, count


def update(
    session: Session, seat_db: Seat, seat_in: dict[str, Any] | SeatUpdate
) -> Seat:
    """
    Update seat information.
    """
    logger.info(f"Updating seat with ID: {seat_db.id}")

    if isinstance(seat_in, BaseModel):
        seat_in = seat_in.model_dump(exclude_unset=True)

    # Check if seat number is changing
    if seat_in.get("seat_number") != seat_db.seat_number:
        query = select(Seat).where(
            Seat.flight_id == seat_db.flight_id,
            Seat.seat_number == seat_in["seat_number"],
        )
        existing_seat = session.exec(query).first()

        if existing_seat:
            logger.warning(
                f"Seat {seat_in['seat_number']} already exists for this flight"
            )
            raise SeatAlreadyExistsError(
                seat_number=seat_in["seat_number"],
                flight_id=seat_db.flight_id,
            )

    try:
        seat_db.sqlmodel_update(seat_in)

        session.add(seat_db)
        session.commit()
        session.refresh(seat_db)

        logger.info(f"Successfully updated seat with ID: {seat_db.id}")
        return seat_db

    except IntegrityError as e:
        session.rollback()
        logger.error(f"Database integrity error during seat update: {str(e)}")
        raise SeatError(500, f"Failed to update seat: {str(e)}") from e


def delete(session: Session, seat_db: Seat) -> None:
    """
    Delete a seat from the database.
    """
    logger.info(f"Deleting seat with ID: {seat_db.id}")

    try:
        session.delete(seat_db)
        session.commit()
        logger.info(f"Successfully deleted seat with ID: {seat_db.id}")

    except Exception as e:
        session.rollback()
        logger.error(f"Error deleting seat with ID {seat_db.id}: {str(e)}")
        raise SeatError(500, f"Failed to delete seat: {str(e)}") from e


def find_available_seat(session: Session, flight_id: str) -> Optional[Seat]:
    """
    Find an available seat for a flight.

    Returns:
        An available seat or None if no seats are available
    """
    logger.info(f"Finding available seat for flight ID: {flight_id}")

    query = select(Seat).where(
        Seat.flight_id == flight_id,
        Seat.is_available == True,
    )
    seat = session.exec(query).first()

    if seat:
        logger.info(f"Found available seat: {seat.seat_number}")
    else:
        logger.warning(f"No available seats found for flight {flight_id}")

    return seat
