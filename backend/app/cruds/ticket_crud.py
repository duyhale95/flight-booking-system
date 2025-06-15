import logging
from typing import Any, Optional

from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, col, func, select

from app.core.exceptions import (
    NoAvailableSeatsError,
    SeatNotAvailableError,
    SeatNotFoundError,
    TicketError,
    TicketNotFoundError,
)
from app.cruds import seat_crud
from app.domain.models import Passenger, Seat, Ticket
from app.domain.schemas import TicketCreate, TicketUpdate

logger = logging.getLogger(__name__)


def create(session: Session, ticket_in: TicketCreate) -> Ticket:
    """
    Create a new ticket in the database.
    """
    logger.info(f"Creating new ticket for passenger ID: {ticket_in.passenger_id}")

    try:
        # Handle seat assignment
        seat_id = ticket_in.seat_id

        if seat_id:
            # If a specific seat is requested
            try:
                seat_db = seat_crud.get_by_id(session, seat_id)
            except SeatNotFoundError:
                logger.warning(f"Seat not found with ID: {seat_id}")
                raise

            if not seat_db.is_available:
                logger.warning(f"Seat {seat_db.seat_number} is not available")
                raise SeatNotAvailableError(seat_number=seat_db.seat_number)

            # Mark seat as unavailable
            seat_db.is_available = False
            session.add(seat_db)

        else:
            # Find any available seat
            seat_db = seat_crud.find_available_seat(session, ticket_in.flight_id)
            if not seat_db:
                logger.warning(f"No available seats for flight {ticket_in.flight_id}")
                raise NoAvailableSeatsError()

            # Mark seat as unavailable and assign to ticket
            seat_db.is_available = False
            session.add(seat_db)
            ticket_in.seat_id = seat_db.id

        # Create the ticket
        ticket_db = Ticket.model_validate(ticket_in)

        session.add(ticket_db)
        session.commit()
        session.refresh(ticket_db)

        logger.info(f"Successfully created ticket with ID: {ticket_db.id}")
        return ticket_db

    except IntegrityError as e:
        session.rollback()
        logger.error(f"Database integrity error during ticket creation: {str(e)}")
        raise TicketError(500, f"Failed to create ticket: {str(e)}") from e


def get_by_id(session: Session, ticket_id: str) -> Ticket:
    """
    Get ticket by ID.
    """
    logger.debug(f"Getting ticket by ID: {ticket_id}")

    ticket_db = session.get(Ticket, ticket_id)
    if not ticket_db:
        logger.warning(f"Ticket not found with ID: {ticket_id}")
        raise TicketNotFoundError(ticket_id=ticket_id)
    return ticket_db


def get_by_ticket_number(session: Session, ticket_number: str) -> Optional[Ticket]:
    """
    Get ticket by ticket number.
    """
    logger.debug(f"Getting ticket by number: {ticket_number}")

    query = select(Ticket).where(Ticket.ticket_number == ticket_number)
    ticket = session.exec(query).first()

    if not ticket:
        logger.warning(f"Ticket not found with number: {ticket_number}")

    return ticket


def get_tickets_by_passenger(
    session: Session, passenger_id: str, skip: int = 0, limit: int = 100
) -> tuple[list[Ticket], int]:
    """
    Get all tickets for a specific passenger.

    Returns:
        Tuple of (list of tickets, count)
    """
    logger.info(f"Getting tickets for passenger ID: {passenger_id}")

    query = select(Ticket).where(Ticket.passenger_id == passenger_id)

    # Get total count
    count_stmt = select(func.count()).select_from(query.subquery())
    count = session.exec(count_stmt).one()

    # Apply pagination
    query = query.offset(skip).limit(limit)
    tickets = list(session.exec(query).all())

    logger.info(
        f"Found {count} tickets for passenger {passenger_id}, "
        f"returning {len(tickets)} results"
    )
    return tickets, count


def get_tickets_by_booking(
    session: Session, booking_id: str, skip: int = 0, limit: int = 100
) -> tuple[list[Ticket], int]:
    """
    Get all tickets for a specific booking.

    Returns:
        Tuple of (list of tickets, count)
    """
    logger.info(f"Getting tickets for booking ID: {booking_id}")

    # First get all passengers for this booking
    passenger_query = select(Passenger.id).where(Passenger.booking_id == booking_id)
    passenger_ids = list(session.exec(passenger_query).all())

    if not passenger_ids:
        logger.info(f"No passengers found for booking {booking_id}")
        return [], 0

    # Then get tickets for these passengers
    query = select(Ticket).where(col(Ticket.passenger_id).in_(passenger_ids))

    # Get total count
    count_stmt = select(func.count()).select_from(query.subquery())
    count = session.exec(count_stmt).one()

    # Apply pagination
    query = query.offset(skip).limit(limit)
    tickets = list(session.exec(query).all())

    logger.info(
        f"Found {count} tickets for booking {booking_id}, "
        f"returning {len(tickets)} results"
    )
    return tickets, count


def get_tickets_by_flight(
    session: Session, flight_id: str, skip: int = 0, limit: int = 100
) -> tuple[list[Ticket], int]:
    """
    Get all tickets for a specific flight.

    Returns:
        Tuple of (list of tickets, count)
    """
    logger.info(f"Getting tickets for flight ID: {flight_id}")

    query = select(Ticket).where(Ticket.flight_id == flight_id)

    # Get total count
    count_stmt = select(func.count()).select_from(query.subquery())
    count = session.exec(count_stmt).one()

    # Apply pagination
    query = query.offset(skip).limit(limit)
    tickets = list(session.exec(query).all())

    logger.info(
        f"Found {count} tickets for flight {flight_id}, "
        f"returning {len(tickets)} results"
    )
    return tickets, count


def get_all_tickets(
    session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[Ticket], int]:
    """
    Get all tickets with pagination.

    Returns:
        Tuple of (list of tickets, count)
    """
    logger.info("Getting all tickets")

    query = select(Ticket)

    # Get total count
    count_stmt = select(func.count()).select_from(query.subquery())
    count = session.exec(count_stmt).one()

    # Apply pagination
    query = query.offset(skip).limit(limit)
    tickets = list(session.exec(query).all())

    logger.info(f"Found {count} tickets, returning {len(tickets)} results")
    return tickets, count


def update(
    session: Session, ticket_db: Ticket, ticket_in: dict[str, Any] | TicketUpdate
) -> Ticket:
    """
    Update ticket information.
    """
    logger.info(f"Updating ticket with ID: {ticket_db.id}")

    if isinstance(ticket_in, BaseModel):
        ticket_in = ticket_in.model_dump(exclude_unset=True)

    try:
        # Handle seat change if needed
        if ticket_in.get("seat_id") != ticket_db.seat_id:
            new_seat_id = ticket_in["seat_id"]

            try:
                new_seat = seat_crud.get_by_id(session, new_seat_id)
            except SeatNotFoundError:
                logger.warning(f"New seat not found with ID: {new_seat_id}")
                raise

            # Check if new seat is available
            if not new_seat.is_available:
                logger.warning(f"New seat {new_seat.seat_number} is not available")
                raise SeatNotAvailableError(seat_number=new_seat.seat_number)

            # Mark new seat as unavailable
            new_seat.is_available = False
            session.add(new_seat)

            # Mark old seat as available if it exists
            if ticket_db.seat_id:
                old_seat = session.get(Seat, ticket_db.seat_id)
                if old_seat:
                    old_seat.is_available = True
                    session.add(old_seat)

        # Update ticket
        ticket_db.sqlmodel_update(ticket_in)
        session.add(ticket_db)
        session.commit()
        session.refresh(ticket_db)

        logger.info(f"Successfully updated ticket with ID: {ticket_db.id}")
        return ticket_db

    except IntegrityError as e:
        session.rollback()
        logger.error(f"Database integrity error during ticket update: {str(e)}")
        raise TicketError(500, f"Failed to update ticket: {str(e)}") from e


def delete(session: Session, ticket_db: Ticket) -> None:
    """
    Delete a ticket from the database.
    """
    logger.info(f"Deleting ticket with ID: {ticket_db.id}")

    try:
        # Mark seat as available if it exists
        if ticket_db.seat_id:
            seat = session.get(Seat, ticket_db.seat_id)
            if seat:
                seat.is_available = True
                session.add(seat)

        # Delete ticket
        session.delete(ticket_db)
        session.commit()
        logger.info(f"Successfully deleted ticket with ID: {ticket_db.id}")

    except Exception as e:
        session.rollback()
        logger.error(f"Error deleting ticket with ID {ticket_db.id}: {str(e)}")
        raise TicketError(500, f"Failed to delete ticket: {str(e)}") from e
