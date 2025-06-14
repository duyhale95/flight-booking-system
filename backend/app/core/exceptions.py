from typing import Optional

from fastapi import HTTPException


def handle_exception(e: "Error") -> HTTPException:
    """Convert an Error to a FastAPI HTTPException"""
    return HTTPException(status_code=e.status_code, detail=e.detail)


class Error(Exception):
    """Base class for all exceptions"""

    def __init__(self, status_code: int = 400, detail: str = "") -> None:
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


class UserError(Error):
    """Base class for user-related exceptions"""

    pass


class UserNotFoundError(UserError):
    """Exception raised when a user is not found"""

    def __init__(
        self, email: Optional[str] = None, user_id: Optional[str] = None
    ) -> None:
        identifier = (
            f" with email {email}"
            if email
            else f" with ID {user_id}"
            if user_id
            else ""
        )
        super().__init__(404, f"User{identifier} not found")


class UserAlreadyExistsError(UserError):
    """Exception raised for duplicate email during user creation"""

    def __init__(self, email: str) -> None:
        super().__init__(400, f"User with email '{email}' already exists")


class AuthenticationError(UserError):
    """Exception raised for authentication failures"""

    def __init__(self, detail: str = "Invalid credentials") -> None:
        super().__init__(401, detail)


class InactiveUserError(UserError):
    """Exception raised when trying to authenticate an inactive user"""

    def __init__(self) -> None:
        super().__init__(403, "Inactive user")


class BookingError(Error):
    """Base class for booking-related exceptions"""

    pass


class BookingNotFoundError(BookingError):
    """Exception raised when a booking is not found"""

    def __init__(
        self, booking_id: Optional[str] = None, booking_number: Optional[str] = None
    ) -> None:
        identifier = (
            f" with ID {booking_id}"
            if booking_id
            else f" with number {booking_number}"
            if booking_number
            else ""
        )
        super().__init__(404, f"Booking{identifier} not found")


class BookingStatusError(BookingError):
    """Exception raised when booking status cannot be updated"""

    def __init__(self, detail: str = "Invalid booking status update") -> None:
        super().__init__(400, detail)


class UnauthorizedBookingAccessError(BookingError):
    """Exception raised when user tries to access a booking they don't own"""

    def __init__(self) -> None:
        super().__init__(403, "Not authorized to access this booking")


class PassengerError(Error):
    """Base class for passenger-related exceptions"""

    pass


class PassengerNotFoundError(PassengerError):
    """Exception raised when a passenger is not found"""

    def __init__(self, passenger_id: Optional[str] = None) -> None:
        identifier = f" with ID {passenger_id}" if passenger_id else ""
        super().__init__(404, f"Passenger{identifier} not found")


class UnauthorizedPassengerAccessError(PassengerError):
    """Exception raised when user tries to access a passenger they don't own"""

    def __init__(self) -> None:
        super().__init__(403, "Not authorized to access this passenger")
