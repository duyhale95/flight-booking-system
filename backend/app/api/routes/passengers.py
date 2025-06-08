from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep, get_current_superuser
from app.models import Booking, Passenger
from app.schemas import (
    Message,
    PassengerCreate,
    PassengerPublic,
    PassengersPublic,
    PassengerUpdate,
)

router = APIRouter(prefix="/passengers", tags=["passengers"])


@router.get("", response_model=PassengersPublic)
def read_passengers(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 10,
    booking_id: Optional[str] = None,
) -> Any:
    statement = select(Passenger)

    if booking_id:
        statement = statement.where(Passenger.booking_id == booking_id)

        # Check if the user has access to this booking
        if not current_user.is_superuser:
            booking = session.get(Booking, booking_id)
            if not booking or booking.user_id != current_user.id:
                raise HTTPException(
                    status_code=403,
                    detail="Not enough permissions to access this booking's passengers"
                )

    # Get total count
    count_statement = select(func.count()).select_from(statement)
    count = session.exec(count_statement).one()

    # Apply pagination
    statement = statement.offset(skip).limit(limit)
    passengers = session.exec(statement).all()

    return {"data": passengers, "count": count}


@router.post("", response_model=PassengerPublic)
def create_passenger(
    session: SessionDep,
    current_user: CurrentUser,
    passenger_in: PassengerCreate,
) -> Any:
    booking = session.get(Booking, passenger_in.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if not current_user.is_superuser and booking.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to add passengers to this booking"
        )

    passenger_db = Passenger.model_validate(passenger_in)
    session.add(passenger_db)
    session.commit()
    session.refresh(passenger_db)
    return passenger_db


@router.get("/{passenger_id}", response_model=PassengerPublic)
def read_passenger(
    session: SessionDep,
    current_user: CurrentUser,
    passenger_id: str,
) -> Any:
    passenger = session.get(Passenger, passenger_id)
    if not passenger:
        raise HTTPException(status_code=404, detail="Passenger not found")

    if not current_user.is_superuser:
        booking = session.get(Booking, passenger.booking_id)
        if not booking or booking.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to access this passenger"
            )

    return passenger


@router.patch("/{passenger_id}", response_model=PassengerPublic)
def update_passenger(
    session: SessionDep,
    current_user: CurrentUser,
    passenger_id: str,
    passenger_in: PassengerUpdate,
) -> Any:
    passenger = session.get(Passenger, passenger_id)
    if not passenger:
        raise HTTPException(status_code=404, detail="Passenger not found")

    if not current_user.is_superuser:
        booking = session.get(Booking, passenger.booking_id)
        if not booking or booking.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to update this passenger"
            )

    new_data = passenger_in.model_dump(exclude_unset=True)
    passenger.sqlmodel_update(new_data)
    session.add(passenger)
    session.commit()
    session.refresh(passenger)
    return passenger


@router.delete(
    "/{passenger_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=Message,
)
def delete_passenger(
    session: SessionDep,
    passenger_id: str,
) -> Any:
    passenger = session.get(Passenger, passenger_id)
    if not passenger:
        raise HTTPException(status_code=404, detail="Passenger not found")

    session.delete(passenger)
    session.commit()
    return Message(msg="Passenger deleted successfully")
