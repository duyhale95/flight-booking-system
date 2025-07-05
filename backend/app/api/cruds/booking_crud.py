import logging
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, func, select

from app.api.cruds import ViewFilter, passenger_crud, ticket_crud
from app.common.exceptions import (
    BookingError,
    BookingNotFoundError,
    BookingStatusError,
    UnauthorizedBookingAccessError,
)
from app.domain.models import Booking, BookingStatus, User
from app.domain.schemas import (
    BookingCreate,
    BookingStatusUpdate,
    BookingUpdate,
    PassengerCreate,
    TicketCreate,
    TicketWithSeat,
)

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


def create_detailed_booking(session: Session, booking_in: BookingCreate) -> Booking:
    """
    Create a booking with passengers and tickets.
    """
    logger.info(f"Creating detailed booking for user ID: {booking_in.user_id}")

    try:
        # Create the booking - Use direct instantiation instead of model_validate
        # to avoid issues with nested Pydantic models like PassengerInfo
        booking_db = Booking(
            total_price=booking_in.total_price,
            status=booking_in.status,
            user_id=booking_in.user_id,
        )

        # Add to session to get an ID
        session.add(booking_db)
        session.flush()  # This assigns an ID without committing

        logger.info(f"Booking created successfully: {booking_db.id}")

        # Create the passengers
        logger.info(
            f"Creating {len(booking_in.passengers)} passengers "
            f"for booking {booking_db.id}"
        )
        created_passengers = []
        for passenger_data in booking_in.passengers:
            passenger_create = PassengerCreate(
                **passenger_data.model_dump(), booking_id=booking_db.id
            )
            passenger_db = passenger_crud.create(session, passenger_create)

            logger.info(f"Passenger created successfully: {passenger_db.id}")
            created_passengers.append(passenger_db)

        # Create the tickets
        flight_id = booking_in.flight_info.flight_id
        seat_ids = booking_in.flight_info.seat_ids
        logger.info(f"Creating {len(seat_ids)} tickets for flight {flight_id}")

        for i, passenger in enumerate(created_passengers):
            ticket_create = TicketCreate(
                passenger_id=passenger.id,
                flight_id=flight_id,
                seat_id=seat_ids[i],
            )
            ticket_db = ticket_crud.create(session, ticket_create)
            logger.info(f"Ticket created successfully: {ticket_db.id}")

        # Commit the transaction
        session.commit()
        session.refresh(booking_db)

        return booking_db

    except Exception as e:
        session.rollback()
        logger.error(f"Error creating detailed booking: {str(e)}")
        raise BookingError(500, f"Failed to create detailed booking: {str(e)}") from e


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


def get_booking_with_details(session: Session, booking_id: str) -> dict[str, Any]:
    """
    Get booking with nested passengers and tickets.
    """
    logger.info(f"Getting booking with details for ID: {booking_id}")

    try:
        booking_db = get_by_id(session, booking_id)

        # Convert to dict for building the response
        booking_data = booking_db.model_dump()

        # Get all passengers for this booking
        passengers, _ = passenger_crud.get_passengers_by_booking(session, booking_id)

        booking_data["passengers"] = []

        # For each passenger, get their tickets and add to the result
        for passenger in passengers:
            passenger_data = passenger.model_dump()

            # Get tickets for this passenger
            tickets, _ = ticket_crud.get_tickets_by_passenger(session, passenger.id)
            passenger_data["tickets"] = [
                TicketWithSeat(
                    **ticket.model_dump(), seat_number=ticket.seat.seat_number
                )
                for ticket in tickets
            ]

            # Add passenger with tickets to the booking
            booking_data["passengers"].append(passenger_data)

        logger.info(f"Successfully retrieved booking with details for ID: {booking_id}")
        return booking_data

    except Exception as e:
        logger.error(f"Error retrieving booking with details: {str(e)}")
        raise BookingError(500, f"Failed to retrieve booking details: {str(e)}") from e


def get_bookings_by_user(
    session: Session,
    user_id: str,
    skip: int = 0,
    limit: int = 100,
    status: Optional[BookingStatus] = None,
    view_filter: ViewFilter = ViewFilter.ACTIVE,
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

    if view_filter == ViewFilter.ACTIVE:
        query = query.where(Booking.deleted == False)
    elif view_filter == ViewFilter.DELETED:
        query = query.where(Booking.deleted == True)

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
    view_filter: ViewFilter = ViewFilter.ACTIVE,
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

    if view_filter == ViewFilter.ACTIVE:
        query = query.where(Booking.deleted == False)
    elif view_filter == ViewFilter.DELETED:
        query = query.where(Booking.deleted == True)

    # Get total count
    count_stmt = select(func.count()).select_from(query.subquery())
    count = session.exec(count_stmt).one()

    # Apply pagination
    query = query.offset(skip).limit(limit)
    bookings = list(session.exec(query).all())

    logger.info(f"Found {count} bookings, returning {len(bookings)} results")
    return bookings, count


def update(
    session: Session,
    booking_db: Booking,
    booking_in: dict[str, Any] | BookingUpdate | BookingStatusUpdate,
) -> Booking:
    """
    Update booking information.
    """
    logger.info(f"Updating booking with ID: {booking_db.id}")

    if isinstance(booking_in, BaseModel):
        booking_in = booking_in.model_dump(exclude_unset=True)

    try:
        booking_db.sqlmodel_update(booking_in)

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
    Soft delete a booking by marking it as deleted.
    """
    logger.info(f"Soft deleting booking with ID: {booking_db.id}")

    try:
        booking_db.deleted = True
        booking_db.deleted_at = datetime.now()
        session.add(booking_db)
        session.commit()
        logger.info(f"Successfully soft deleted booking with ID: {booking_db.id}")

    except Exception as e:
        session.rollback()
        logger.error(f"Error soft deleting booking with ID {booking_db.id}: {str(e)}")
        raise BookingError(500, f"Failed to soft delete booking: {str(e)}") from e


def hard_delete(session: Session, booking_db: Booking) -> None:
    """
    Hard delete a booking.
    """
    logger.info(f"Hard deleting booking with ID: {booking_db.id}")

    try:
        session.delete(booking_db)
        session.commit()
        logger.info(f"Successfully hard deleted booking with ID: {booking_db.id}")

    except Exception as e:
        session.rollback()
        logger.error(f"Error hard deleting booking with ID {booking_db.id}: {str(e)}")
        raise BookingError(500, f"Failed to hard delete booking: {str(e)}") from e


def restore(session: Session, booking_db: Booking) -> Booking:
    """
    Restore a soft-deleted booking.
    """
    logger.info(f"Restoring soft-deleted booking with ID: {booking_db.id}")

    if not booking_db.deleted:
        logger.warning(f"Booking {booking_db.id} is not deleted, cannot restore")
        return booking_db

    try:
        booking_db.deleted = False
        booking_db.deleted_at = None
        session.add(booking_db)
        session.commit()
        session.refresh(booking_db)

        logger.info(f"Successfully restored booking with ID: {booking_db.id}")
        return booking_db

    except Exception as e:
        session.rollback()
        logger.error(f"Error restoring booking with ID {booking_db.id}: {str(e)}")
        raise BookingError(500, f"Failed to restore booking: {str(e)}") from e


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
