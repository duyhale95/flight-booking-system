import logging
from datetime import date
from typing import Any, Optional

from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, Time, col, func, select

from app.api.cruds import seat_crud
from app.common.exceptions import (
    FlightAlreadyExistsError,
    FlightError,
    FlightNotFoundError,
)
from app.domain.models import Flight
from app.domain.schemas import FlightCreate, FlightSearch, FlightUpdate, SeatCreate
from app.utils import generate_seat_numbers

logger = logging.getLogger(__name__)


def create(session: Session, flight_in: FlightCreate) -> Flight:
    """
    Create a new flight in the database.
    """
    logger.info(
        f"Creating new flight with number: {flight_in.flight_number} "
        f"on {flight_in.flight_date}"
    )

    # Check if the flight already exists
    query = select(Flight).where(
        Flight.flight_number == flight_in.flight_number,
        Flight.flight_date == flight_in.flight_date,
        Flight.departure_time == flight_in.departure_time,
    )
    existing_flight = session.exec(query).first()

    if existing_flight:
        logger.warning(
            f"Flight with number {flight_in.flight_number} on {flight_in.flight_date} "
            f"at {flight_in.departure_time} already exists"
        )
        raise FlightAlreadyExistsError(
            flight_number=flight_in.flight_number,
            flight_date=str(flight_in.flight_date),
        )

    try:
        flight_db = Flight.model_validate(flight_in)

        session.add(flight_db)
        session.commit()
        session.refresh(flight_db)

        logger.info(f"Successfully created flight with ID: {flight_db.id}")
        return flight_db

    except IntegrityError as e:
        session.rollback()
        logger.error(f"Database integrity error during flight creation: {str(e)}")
        raise FlightError(500, f"Failed to create flight: {str(e)}") from e


def create_with_seats(session: Session, flight_in: FlightCreate) -> Flight:
    """
    Create a new flight and associated seats.
    """
    logger.info(f"Creating flight with number: {flight_in.flight_number}")

    try:
        # Create the flight
        flight_db = create(session, flight_in)
        logger.info(f"Flight created successfully: {flight_db.id}")

        # Create seats
        for seat_number in generate_seat_numbers(flight_in.available_seats):
            seat_create = SeatCreate(flight_id=flight_db.id, seat_number=seat_number)
            seat_db = seat_crud.create(session, seat_create)

            logger.info(f"Seat created successfully: {seat_db.id}")

        # Commit the transaction
        session.commit()
        session.refresh(flight_db)

        return flight_db

    except Exception as e:
        session.rollback()
        logger.error(
            f"Error creating flight with number: {flight_in.flight_number}: {str(e)}"
        )
        raise FlightError(500, f"Failed to create flight: {str(e)}") from e


def get_by_id(session: Session, flight_id: str) -> Flight:
    """
    Get flight by ID.
    """
    logger.debug(f"Getting flight by ID: {flight_id}")

    flight_db = session.get(Flight, flight_id)
    if not flight_db:
        logger.warning(f"Flight not found with ID: {flight_id}")
        raise FlightNotFoundError(flight_id=flight_id)
    return flight_db


def get_by_flight_number(
    session: Session, flight_number: str, flight_date: Optional[date] = None
) -> Flight | None:
    """
    Get flight by flight number and optionally flight date.
    """
    logger.debug(f"Getting flight by number: {flight_number}")

    query = select(Flight).where(Flight.flight_number == flight_number)

    if flight_date:
        query = query.where(Flight.flight_date == flight_date)

    return session.exec(query).first()


def search_flights(session: Session, search: FlightSearch) -> tuple[list[Flight], int]:
    """
    Search for flights with various filters.

    Returns:
        Tuple of (list of flights, count)
    """
    logger.info("Searching flights with filters")

    query = select(Flight)

    # Apply filters
    if search.flight_date:
        query = query.where(Flight.flight_date == search.flight_date)

    if search.departure_code:
        query = query.where(Flight.departure_code == search.departure_code)

    if search.arrival_code:
        query = query.where(Flight.arrival_code == search.arrival_code)

    if search.airline_code:
        query = query.where(Flight.airline_code == search.airline_code)

    if search.start_price is not None and search.end_price is not None:
        query = query.where(
            col(Flight.price).between(search.start_price, search.end_price)
        )

    query = query.where(
        func.cast(col(Flight.departure_time), Time()).between(
            search.departure_start_time, search.departure_end_time
        )
    )
    query = query.where(
        func.cast(col(Flight.arrival_time), Time()).between(
            search.arrival_start_time, search.arrival_end_time
        )
    )

    # Apply sorting
    query = query.order_by(col(Flight.departure_time).asc())

    # Get total count
    count_stmt = select(func.count()).select_from(query.subquery())
    count = session.exec(count_stmt).one()

    # Apply pagination
    query = query.offset(search.skip).limit(search.limit)
    flights = list(session.exec(query).all())

    logger.info(f"Found {count} flights, returning {len(flights)} results")
    return flights, count


def update(
    session: Session, flight_db: Flight, flight_in: dict[str, Any] | FlightUpdate
) -> Flight:
    """
    Update flight information.
    """
    logger.info(f"Updating flight with ID: {flight_db.id}")

    if isinstance(flight_in, BaseModel):
        flight_in = flight_in.model_dump(exclude_unset=True)

    try:
        flight_db.sqlmodel_update(flight_in)

        session.add(flight_db)
        session.commit()
        session.refresh(flight_db)

        logger.info(f"Successfully updated flight with ID: {flight_db.id}")
        return flight_db

    except IntegrityError as e:
        session.rollback()
        logger.error(f"Database integrity error during flight update: {str(e)}")
        raise FlightError(500, f"Failed to update flight: {str(e)}") from e


def delete(session: Session, flight_db: Flight) -> None:
    """
    Delete a flight from the database.
    """
    logger.info(f"Deleting flight with ID: {flight_db.id}")

    try:
        session.delete(flight_db)
        session.commit()
        logger.info(f"Successfully deleted flight with ID: {flight_db.id}")

    except Exception as e:
        session.rollback()
        logger.error(f"Error deleting flight with ID {flight_db.id}: {str(e)}")
        raise FlightError(500, f"Failed to delete flight: {str(e)}") from e
