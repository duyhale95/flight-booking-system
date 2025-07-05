import logging
from typing import Any, Optional

from fastapi import HTTPException, status

from app.common.logging import sanitize_data

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Base exception for all application errors."""

    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail = "Internal server error"
    error_code = "internal_server_error"

    def __init__(
        self,
        status_code: Optional[int] = None,
        detail: Optional[str] = None,
        error_code: Optional[str] = None,
        **context: Any,
    ) -> None:
        self.status_code = status_code if status_code else self.status_code
        self.detail = detail if detail else self.detail
        self.error_code = error_code if error_code else self.error_code
        self.context = context
        super().__init__(self.detail)


# User related errors
class UserError(AppError):
    """Base exception for user-related errors."""

    status_code = status.HTTP_400_BAD_REQUEST
    detail = "User error"
    error_code = "user_error"


class UserNotFoundError(UserError):
    """Exception raised when a user is not found."""

    status_code = status.HTTP_404_NOT_FOUND
    detail = "User not found"
    error_code = "user_not_found"

    def __init__(
        self, user_id: Optional[str] = None, email: Optional[str] = None, **kwargs: Any
    ) -> None:
        identifier = f"email: {email}" if email else f"ID: {user_id}"
        self.detail = f"User not found with {identifier}"
        self.user_id = user_id
        self.email = email
        super().__init__(**kwargs)


class UserAlreadyExistsError(UserError):
    """Exception raised when a user already exists."""

    status_code = status.HTTP_409_CONFLICT
    detail = "User already exists"
    error_code = "user_already_exists"

    def __init__(self, email: Optional[str] = None, **kwargs: Any) -> None:
        self.detail = (
            f"User already exists with email: {email}" if email else self.detail
        )
        self.email = email
        super().__init__(**kwargs)


class AuthenticationError(UserError):
    """Exception raised when authentication fails."""

    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Incorrect email or password"
    error_code = "authentication_error"

    def __init__(self, detail: Optional[str] = None, **kwargs: Any) -> None:
        self.detail = detail if detail else self.detail
        super().__init__(**kwargs)


class InactiveUserError(UserError):
    """Exception raised when an inactive user attempts to authenticate."""

    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Inactive user"
    error_code = "inactive_user"


# Booking related errors
class BookingError(AppError):
    """Base class for booking-related exceptions."""

    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Booking error"
    error_code = "booking_error"


class BookingNotFoundError(BookingError):
    """Exception raised when a booking is not found."""

    status_code = status.HTTP_404_NOT_FOUND
    detail = "Booking not found"
    error_code = "booking_not_found"

    def __init__(
        self,
        booking_id: Optional[str] = None,
        booking_number: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        identifier = (
            f"number: {booking_number}" if booking_number else f"ID: {booking_id}"
        )
        self.detail = f"Booking not found with {identifier}"
        self.booking_id = booking_id
        self.booking_number = booking_number
        super().__init__(**kwargs)


class BookingStatusError(BookingError):
    """Exception raised when booking status cannot be updated."""

    def __init__(
        self, detail: str = "Invalid booking status update", **kwargs: Any
    ) -> None:
        super().__init__(detail=detail, **kwargs)


class UnauthorizedBookingAccessError(BookingError):
    """Exception raised when user tries to access a booking they don't own."""

    status_code = status.HTTP_403_FORBIDDEN
    detail = "Not authorized to access this booking"
    error_code = "unauthorized_booking_access"


# Passenger related errors
class PassengerError(AppError):
    """Base class for passenger-related exceptions."""

    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Passenger error"
    error_code = "passenger_error"


class PassengerNotFoundError(PassengerError):
    """Exception raised when a passenger is not found."""

    status_code = status.HTTP_404_NOT_FOUND
    detail = "Passenger not found"
    error_code = "passenger_not_found"

    def __init__(self, passenger_id: Optional[str] = None, **kwargs: Any) -> None:
        self.detail = (
            f"Passenger not found with ID: {passenger_id}"
            if passenger_id
            else self.detail
        )
        self.passenger_id = passenger_id
        super().__init__(**kwargs)


class UnauthorizedPassengerAccessError(PassengerError):
    """Exception raised when user tries to access a passenger they don't own."""

    status_code = status.HTTP_403_FORBIDDEN
    detail = "Not authorized to access this passenger"
    error_code = "unauthorized_passenger_access"


# Flight related errors
class FlightError(AppError):
    """Base class for flight-related exceptions."""

    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Flight error"
    error_code = "flight_error"


class FlightNotFoundError(FlightError):
    """Exception raised when a flight is not found."""

    status_code = status.HTTP_404_NOT_FOUND
    detail = "Flight not found"
    error_code = "flight_not_found"

    def __init__(
        self,
        flight_id: Optional[str] = None,
        flight_number: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        identifier = f"number: {flight_number}" if flight_number else f"ID: {flight_id}"
        self.detail = f"Flight not found with {identifier}"
        self.flight_id = flight_id
        self.flight_number = flight_number
        super().__init__(**kwargs)


class FlightAlreadyExistsError(FlightError):
    """Exception raised when trying to create a duplicate flight."""

    status_code = status.HTTP_409_CONFLICT
    detail = "Flight already exists"
    error_code = "flight_already_exists"

    def __init__(self, flight_number: str, flight_date: str, **kwargs: Any) -> None:
        self.detail = f"Flight number '{flight_number}' on {flight_date} already exists"
        self.flight_number = flight_number
        self.flight_date = flight_date
        super().__init__(**kwargs)


# Seat related errors
class SeatError(AppError):
    """Base class for seat-related exceptions."""

    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Seat error"
    error_code = "seat_error"


class SeatNotFoundError(SeatError):
    """Exception raised when a seat is not found."""

    status_code = status.HTTP_404_NOT_FOUND
    detail = "Seat not found"
    error_code = "seat_not_found"

    def __init__(
        self,
        seat_id: Optional[str] = None,
        seat_number: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        identifier = f"number: {seat_number}" if seat_number else f"ID: {seat_id}"
        self.detail = f"Seat not found with {identifier}"
        self.seat_id = seat_id
        self.seat_number = seat_number
        super().__init__(**kwargs)


class SeatAlreadyExistsError(SeatError):
    """Exception raised when trying to create a duplicate seat."""

    status_code = status.HTTP_409_CONFLICT
    detail = "Seat already exists"
    error_code = "seat_already_exists"

    def __init__(self, seat_number: str, flight_id: str, **kwargs: Any) -> None:
        self.detail = f"Seat {seat_number} already exists for flight {flight_id}"
        self.seat_number = seat_number
        self.flight_id = flight_id
        super().__init__(**kwargs)


class SeatNotAvailableError(SeatError):
    """Exception raised when trying to assign an unavailable seat."""

    def __init__(self, seat_number: Optional[str] = None, **kwargs: Any) -> None:
        self.detail = (
            f"Seat {seat_number} is not available"
            if seat_number
            else "Seat is not available"
        )
        self.seat_number = seat_number
        super().__init__(**kwargs)


# Ticket related errors
class TicketError(AppError):
    """Base class for ticket-related exceptions."""

    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Ticket error"
    error_code = "ticket_error"


class TicketNotFoundError(TicketError):
    """Exception raised when a ticket is not found."""

    status_code = status.HTTP_404_NOT_FOUND
    detail = "Ticket not found"
    error_code = "ticket_not_found"

    def __init__(
        self,
        ticket_id: Optional[str] = None,
        ticket_number: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        identifier = f"number: {ticket_number}" if ticket_number else f"ID: {ticket_id}"
        self.detail = f"Ticket not found with {identifier}"
        self.ticket_id = ticket_id
        self.ticket_number = ticket_number
        super().__init__(**kwargs)


class NoAvailableSeatsError(TicketError):
    """Exception raised when there are no available seats for a flight."""

    status_code = status.HTTP_400_BAD_REQUEST
    detail = "No available seats for this flight"
    error_code = "no_available_seats"


def handle_exception(error: Exception) -> HTTPException:
    """
    Convert application exceptions to FastAPI HTTPExceptions and log appropriately.

    Args:
        error: The exception to handle

    Returns:
        HTTPException: FastAPI HTTP exception
    """
    # Handle AppError subclasses
    if isinstance(error, AppError):
        # Get the status code as an integer
        status_code = error.status_code
        # Ensure status_code is an integer
        if isinstance(status_code, str):
            try:
                status_code = int(status_code)
            except (ValueError, TypeError):
                status_code = 500

        # Log error with appropriate level and context
        if status_code >= 500:
            # Server errors are logged as ERROR
            logger.error(
                "Server error occurred: %s",
                error.detail,
                extra=sanitize_data(error.context),
                exc_info=True,
            )
        elif status_code >= 400:
            # Client errors are logged as WARNING
            logger.warning(
                "Client error occurred: %s",
                error.detail,
                extra=sanitize_data(error.context),
            )

        return HTTPException(
            status_code=error.status_code,
            detail={"message": error.detail, "error_code": error.error_code},
        )

    # Handle unexpected exceptions
    logger.error("Unexpected error occurred: %s", str(error), exc_info=True)

    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail={
            "message": "Internal server error",
            "error_code": "internal_server_error",
        },
    )
