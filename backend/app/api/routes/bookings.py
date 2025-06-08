from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import (
    CurrentUser,
    SessionDep,
)
from app.models import Booking
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
) -> Any:
    statement = select(Booking)

    if not current_user.is_superuser:
        statement = statement.where(Booking.user_id == current_user.id)

    # Get total count
    count_statement = select(func.count()).select_from(statement)
    count = session.exec(count_statement).one()

    # Apply pagination
    statement = statement.offset(skip).limit(limit)
    bookings = session.exec(statement).all()

    return {"data": bookings, "count": count}


@router.post("", response_model=BookingPublic)
def create_booking(
    session: SessionDep,
    current_user: CurrentUser,
    booking_in: BookingCreate,
) -> Any:
    if not current_user.is_superuser and booking_in.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Users can only create bookings for themselves",
        )

    booking_db = Booking.model_validate(booking_in)
    session.add(booking_db)
    session.commit()
    session.refresh(booking_db)
    return booking_db


@router.get("/{booking_id}", response_model=BookingPublic)
def read_booking(
    session: SessionDep,
    current_user: CurrentUser,
    booking_id: str,
) -> Any:
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if not current_user.is_superuser and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return booking


@router.patch("/{booking_id}", response_model=BookingPublic)
def update_booking(
    session: SessionDep,
    current_user: CurrentUser,
    booking_id: str,
    booking_in: BookingUpdate,
) -> Any:
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if not current_user.is_superuser and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    new_data = booking_in.model_dump(exclude_unset=True)
    booking.sqlmodel_update(new_data)
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


@router.delete(
    "/{booking_id}",
    response_model=Message,
)
def delete_booking(
    session: SessionDep,
    current_user: CurrentUser,
    booking_id: str,
) -> Any:
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if not current_user.is_superuser and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    session.delete(booking)
    session.commit()
    return Message(msg="Booking deleted successfully")
