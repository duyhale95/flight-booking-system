import logging
from typing import Any, Optional

from fastapi import APIRouter

from app.api.cruds import ViewFilter, booking_crud, passenger_crud, ticket_crud
from app.api.deps import CurrentUser, SessionDep
from app.common.exceptions import (
    BookingError,
    PassengerError,
    TicketError,
    UnauthorizedBookingAccessError,
    handle_exception,
)
from app.domain.models import BookingStatus
from app.domain.schemas import (
    BookingCreate,
    BookingDetailPublic,
    BookingPublic,
    BookingsPublic,
    Message,
    PassengerPublic,
    PassengersPublic,
    PassengerUpdate,
    TicketPublic,
    TicketsPublic,
)

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
    Create a booking for the current user with passengers and tickets.
    """
    logger.info(f"Creating booking for user ID: {current_user.id}")

    try:
        if booking_in.user_id != current_user.id:
            logger.warning(
                f"User {current_user.id} is not authorized to create booking "
                f"for user {booking_in.user_id}"
            )
            raise UnauthorizedBookingAccessError()

        booking_db = booking_crud.create_detailed_booking(session, booking_in)

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

@router.get("/{booking_id}/details", response_model=BookingDetailPublic)
def read_user_booking_details(
    session: SessionDep, current_user: CurrentUser, booking_id: str
) -> Any:
    """
    Retrieve a booking by ID with passenger and ticket information for the current user.
    """
    logger.info(
        f"Retrieving detailed booking with ID: {booking_id} "
        f"for user ID: {current_user.id}"
    )

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)
        booking_crud.verify_user_can_access_booking(booking_db, current_user)

        booking_details = booking_crud.get_booking_with_details(session, booking_id)

        logger.info(f"Detailed booking retrieved successfully: {booking_db.id}")
        return booking_details

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


@router.get(
    "/{booking_id}/passengers", response_model=PassengersPublic, tags=["passengers"]
)
def read_booking_passengers(
    session: SessionDep,
    current_user: CurrentUser,
    booking_id: str,
    skip: int = 0,
    limit: int = 10,
) -> Any:
    """
    Retrieve passengers for a specific booking owned by the current user.
    """
    logger.info(
        f"Retrieving passengers for booking ID: {booking_id}, "
        f"user ID: {current_user.id}"
    )

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)

        # Check permissions
        booking_crud.verify_user_can_access_booking(booking_db, current_user)

        passengers, count = passenger_crud.get_passengers_by_booking(
            session, booking_id, skip, limit
        )

        logger.info(f"Retrieved {count} passengers for booking: {booking_id}")
        return {"data": passengers, "count": count}

    except (BookingError, PassengerError) as e:
        logger.error(f"Error retrieving booking passengers: {str(e)}")
        raise handle_exception(e) from e


@router.get(
    "/{booking_id}/passengers/{passenger_id}",
    response_model=PassengerPublic,
    tags=["passengers"],
)
def read_booking_passenger(
    session: SessionDep,
    current_user: CurrentUser,
    booking_id: str,
    passenger_id: str,
) -> Any:
    """
    Retrieve a specific passenger from a booking owned by the current user.
    """
    logger.info(
        f"Retrieving passenger ID: {passenger_id} from booking ID: {booking_id}"
    )

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)
        booking_crud.verify_user_can_access_booking(booking_db, current_user)

        passenger_db = passenger_crud.get_by_id(session, passenger_id)
        if passenger_db.booking_id != booking_id:
            raise PassengerError(
                404, f"Passenger {passenger_id} not found in booking {booking_id}"
            )

        logger.info(f"Passenger retrieved successfully: {passenger_db.id}")
        return passenger_db

    except (BookingError, PassengerError) as e:
        logger.error(f"Error retrieving booking passenger: {str(e)}")
        raise handle_exception(e) from e


@router.patch(
    "/{booking_id}/passengers/{passenger_id}",
    response_model=PassengerPublic,
    tags=["passengers"],
)
def update_booking_passenger(
    session: SessionDep,
    current_user: CurrentUser,
    booking_id: str,
    passenger_id: str,
    passenger_in: PassengerUpdate,
) -> Any:
    """
    Update a specific passenger from a booking owned by the current user.
    """
    logger.info(f"Updating passenger ID: {passenger_id} from booking ID: {booking_id}")

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)
        booking_crud.verify_user_can_access_booking(booking_db, current_user)

        passenger_db = passenger_crud.get_by_id(session, passenger_id)
        if passenger_db.booking_id != booking_id:
            raise PassengerError(
                404, f"Passenger {passenger_id} not found in booking {booking_id}"
            )

        updated_passenger = passenger_crud.update(session, passenger_db, passenger_in)

        logger.info(f"Passenger updated successfully: {passenger_id}")
        return updated_passenger

    except (BookingError, PassengerError) as e:
        logger.error(f"Error updating booking passenger: {str(e)}")
        raise handle_exception(e) from e


@router.get("/{booking_id}/tickets", response_model=TicketsPublic, tags=["tickets"])
def read_booking_tickets(
    session: SessionDep,
    current_user: CurrentUser,
    booking_id: str,
    skip: int = 0,
    limit: int = 10,
) -> Any:
    """
    Retrieve tickets for a specific booking owned by the current user.
    """
    logger.info(
        f"Retrieving tickets for booking ID: {booking_id}, user ID: {current_user.id}"
    )

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)
        booking_crud.verify_user_can_access_booking(booking_db, current_user)

        tickets, count = ticket_crud.get_tickets_by_booking(
            session, booking_id, skip, limit
        )

        logger.info(f"Retrieved {count} tickets for booking: {booking_id}")
        return {"data": tickets, "count": count}

    except (BookingError, TicketError) as e:
        logger.error(f"Error retrieving booking tickets: {str(e)}")
        raise handle_exception(e) from e


@router.get(
    "/{booking_id}/tickets/{ticket_id}", response_model=TicketPublic, tags=["tickets"]
)
def read_booking_ticket(
    session: SessionDep, current_user: CurrentUser, booking_id: str, ticket_id: str
) -> Any:
    """
    Retrieve a specific ticket from a booking owned by the current user.
    """
    logger.info(f"Retrieving ticket ID: {ticket_id} from booking ID: {booking_id}")

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)
        booking_crud.verify_user_can_access_booking(booking_db, current_user)

        ticket_db = ticket_crud.get_by_id(session, ticket_id)
        passenger = passenger_crud.get_by_id(session, ticket_db.passenger_id)
        if passenger.booking_id != booking_id:
            raise TicketError(
                404, f"Ticket {ticket_id} not found in booking {booking_id}"
            )

        logger.info(f"Ticket retrieved successfully: {ticket_db.id}")
        return ticket_db

    except (BookingError, TicketError, PassengerError) as e:
        logger.error(f"Error retrieving booking ticket: {str(e)}")
        raise handle_exception(e) from e


@router.get(
    "/{booking_id}/passengers/{passenger_id}/tickets",
    response_model=TicketsPublic,
    tags=["tickets"],
)
def read_passenger_tickets(
    session: SessionDep,
    current_user: CurrentUser,
    booking_id: str,
    passenger_id: str,
    skip: int = 0,
    limit: int = 10,
) -> Any:
    """
    Retrieve tickets for a specific passenger in a booking owned by the current user.
    """
    logger.info(
        f"Retrieving tickets for passenger ID: {passenger_id}, booking ID: {booking_id}"
    )

    try:
        booking_db = booking_crud.get_by_id(session, booking_id)
        booking_crud.verify_user_can_access_booking(booking_db, current_user)

        passenger_db = passenger_crud.get_by_id(session, passenger_id)
        if passenger_db.booking_id != booking_id:
            raise PassengerError(
                404, f"Passenger {passenger_id} not found in booking {booking_id}"
            )

        tickets, count = ticket_crud.get_tickets_by_passenger(
            session, passenger_id, skip, limit
        )

        logger.info(f"Retrieved {count} tickets for passenger: {passenger_id}")
        return {"data": tickets, "count": count}

    except (BookingError, PassengerError, TicketError) as e:
        logger.error(f"Error retrieving passenger tickets: {str(e)}")
        raise handle_exception(e) from e
