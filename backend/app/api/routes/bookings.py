from typing import Any, Optional

from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.core.exceptions import (
    BookingError,
    UnauthorizedBookingAccessError,
    handle_exception,
)
from app.cruds import booking_crud
from app.models.booking import BookingStatus
from app.schemas import (
    BookingCreate,
    BookingPublic,
    BookingsPublic,
    BookingUpdate,
    Message,
)

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("", response_model=BookingsPublic)
def read_bookings(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 10,
    status: Optional[BookingStatus] = None,
) -> Any:
    try:
        if current_user.is_superuser:
            bookings, count = booking_crud.get_all_bookings(
                session, skip, limit, status
            )
        else:
            bookings, count = booking_crud.get_bookings_by_user(
                session, current_user.id, skip, limit, status
            )
        return {"data": bookings, "count": count}

    except BookingError as e:
        raise handle_exception(e) from e


@router.post("", response_model=BookingPublic)
def create_booking(
    session: SessionDep, current_user: CurrentUser, booking_in: BookingCreate
) -> Any:
    try:
        if not current_user.is_superuser and booking_in.user_id != current_user.id:
            raise UnauthorizedBookingAccessError()

        booking_db = booking_crud.create(session, booking_in)
        return booking_db

    except BookingError as e:
        raise handle_exception(e) from e


@router.get("/{booking_id}", response_model=BookingPublic)
def read_booking(
    session: SessionDep, current_user: CurrentUser, booking_id: str
) -> Any:
    try:
        booking_db = booking_crud.get_by_id(session, booking_id)

        # Check permissions
        booking_crud.verify_user_can_access_booking(booking_db, current_user)

        return booking_db

    except BookingError as e:
        raise handle_exception(e) from e


@router.patch("/{booking_id}", response_model=BookingPublic)
def update_booking(
    session: SessionDep,
    current_user: CurrentUser,
    booking_id: str,
    booking_in: BookingUpdate,
) -> Any:
    try:
        booking_db = booking_crud.get_by_id(session, booking_id)

        # Check permissions
        booking_crud.verify_user_can_access_booking(booking_db, current_user)

        if booking_in.status is not None:
            status = booking_in.status

            update_data = booking_in.model_dump(exclude={"status"}, exclude_unset=True)
            if update_data:
                booking_db = booking_crud.update(session, booking_db, update_data)

            booking_db = booking_crud.update_booking_status(session, booking_db, status)
        else:
            booking_db = booking_crud.update(session, booking_db, booking_in)

        return booking_db

    except BookingError as e:
        raise handle_exception(e) from e


@router.delete("/{booking_id}", response_model=Message)
def delete_booking(
    session: SessionDep, current_user: CurrentUser, booking_id: str
) -> Any:
    try:
        booking_db = booking_crud.get_by_id(session, booking_id)

        # Check permissions
        booking_crud.verify_user_can_access_booking(booking_db, current_user)

        booking_crud.delete(session, booking_db)

        return Message(msg="Booking deleted successfully")

    except BookingError as e:
        raise handle_exception(e) from e
