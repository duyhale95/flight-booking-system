from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_superuser
from app.models import Flight, Seat
from app.schemas import Message, SeatCreate, SeatPublic, SeatsPublic, SeatUpdate

router = APIRouter(prefix="/seats", tags=["seats"])


@router.get(
    "",
    dependencies=[Depends(get_current_superuser)],
    response_model=SeatsPublic,
)
def read_seats(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    flight_id: Optional[str] = None,
    available_only: bool = False,
) -> Any:
    statement = select(Seat)

    if flight_id:
        statement = statement.where(Seat.flight_id == flight_id)

    if available_only:
        statement = statement.where(Seat.is_available is True)

    # Get total count
    count_statement = select(func.count()).select_from(statement)
    count = session.exec(count_statement).one()

    # Apply pagination
    statement = statement.offset(skip).limit(limit)
    seats = session.exec(statement).all()

    return {"data": seats, "count": count}


@router.post(
    "",
    dependencies=[Depends(get_current_superuser)],
    response_model=SeatPublic,
)
def create_seat(
    session: SessionDep,
    seat_in: SeatCreate,
) -> Any:
    flight = session.get(Flight, seat_in.flight_id)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")

    statement = select(Seat).where(
        Seat.flight_id == seat_in.flight_id,
        Seat.seat_number == seat_in.seat_number,
    )
    existing_seat = session.exec(statement).first()

    if existing_seat:
        raise HTTPException(
            status_code=409,
            detail=f"Seat {seat_in.seat_number} already exists",
        )

    db_seat = Seat.model_validate(seat_in)
    session.add(db_seat)
    session.commit()
    session.refresh(db_seat)
    return db_seat


@router.get("/{seat_id}", response_model=SeatPublic)
def read_seat(session: SessionDep, seat_id: str) -> Any:
    seat = session.get(Seat, seat_id)
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    return seat


@router.patch(
    "/{seat_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=SeatPublic,
)
def update_seat(
    session: SessionDep,
    seat_id: str,
    seat_in: SeatUpdate,
) -> Any:
    seat = session.get(Seat, seat_id)
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")

    if seat_in.seat_number and seat_in.seat_number != seat.seat_number:
        statement = select(Seat).where(
            Seat.flight_id == seat.flight_id,
            Seat.seat_number == seat_in.seat_number,
        )
        existing_seat = session.exec(statement).first()

        if existing_seat:
            raise HTTPException(
                status_code=409,
                detail=f"Seat {seat_in.seat_number} already exists",
            )

    new_data = seat_in.model_dump(exclude_unset=True)
    seat.sqlmodel_update(new_data)
    session.add(seat)
    session.commit()
    session.refresh(seat)
    return seat


@router.delete(
    "/{seat_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=Message,
)
def delete_seat(session: SessionDep, seat_id: str) -> Any:
    seat = session.get(Seat, seat_id)
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")

    session.delete(seat)
    session.commit()
    return Message(msg="Seat deleted successfully")
