from fastapi import HTTPException


class Error(Exception):
    """Base class for all exceptions"""

    def __init__(self, status_code: int = 400, detail: str = ""):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


class UserError(Error):
    """Base class for user-related exceptions"""

    pass


class UserNotFoundError(UserError):
    """Exception raised when a user is not found"""

    def __init__(self, email: str = None, user_id: str = None):
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

    def __init__(self, email: str):
        super().__init__(400, f"User with email '{email}' already exists")


class AuthenticationError(UserError):
    """Exception raised for authentication failures"""

    def __init__(self, detail: str = "Invalid credentials"):
        super().__init__(401, detail)


class InactiveUserError(UserError):
    """Exception raised when trying to authenticate an inactive user"""

    def __init__(self):
        super().__init__(403, "Inactive user")


def handle_exception(e: Error) -> HTTPException:
    """Convert an Error to a FastAPI HTTPException"""
    return HTTPException(status_code=e.status_code, detail=e.detail)
