from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Time, col, func, select

from app.api.deps import SessionDep, get_current_superuser
from app.models import Flight
from app.schemas import (
    FlightCreate,
    FlightPublic,
    FlightSearch,
    FlightsPublic,
    FlightUpdate,
    Message,
)

router = APIRouter(prefix="/flights", tags=["flights"])


@router.get("", response_model=FlightsPublic)
def read_flights(
    session: SessionDep,
    search: Annotated[FlightSearch, Query()],
) -> Any:
    statement = select(Flight)

    # Apply filters
    if search.flight_date:
        statement = statement.where(Flight.flight_date == search.flight_date)

    if search.departure_code:
        statement = statement.where(Flight.departure_code == search.departure_code)

    if search.arrival_code:
        statement = statement.where(Flight.arrival_code == search.arrival_code)

    if search.airline_code:
        statement = statement.where(Flight.airline_code == search.airline_code)

    if search.start_price is not None and search.end_price is not None:
        statement = statement.where(
            col(Flight.price).between(search.start_price, search.end_price)
        )

    statement = statement.where(
        func.cast(col(Flight.departure_time), Time()).between(
            search.departure_start_time, search.departure_end_time
        )
    )
    statement = statement.where(
        func.cast(col(Flight.arrival_time), Time()).between(
            search.arrival_start_time, search.arrival_end_time
        )
    )

    # Apply sorting
    statement = statement.order_by(col(Flight.departure_time).asc())

    # Get total count
    count_statement = select(func.count()).select_from(statement)
    count = session.exec(count_statement).one()

    # Apply pagination
    statement = statement.offset(search.skip).limit(search.limit)
    flights = session.exec(statement).all()

    return {"data": flights, "count": count}


@router.post(
    "",
    dependencies=[Depends(get_current_superuser)],
    response_model=FlightPublic,
)
def create_flight(session: SessionDep, flight_in: FlightCreate) -> Any:
    # Check if the flight already exists
    statement = select(Flight).where(
        Flight.flight_number == flight_in.flight_number,
        Flight.flight_date == flight_in.flight_date,
        Flight.departure_time == flight_in.departure_time,
    )
    existing_flight = session.exec(statement).first()

    if existing_flight:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Flight with number {flight_in.flight_number} "
                f"on {flight_in.flight_date} "
                f"at {flight_in.departure_time} "
                f"already exists"
            ),
        )

    db_flight = Flight.model_validate(flight_in)
    session.add(db_flight)
    session.commit()
    session.refresh(db_flight)
    return db_flight


@router.get("/{flight_id}", response_model=FlightPublic)
def read_flight(session: SessionDep, flight_id: str) -> Any:
    flight = session.get(Flight, flight_id)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return flight


@router.patch(
    "/{flight_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=FlightPublic,
)
def update_flight(session: SessionDep, flight_id: str, flight_in: FlightUpdate) -> Any:
    flight = session.get(Flight, flight_id)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")

    new_data = flight_in.model_dump(exclude_unset=True)
    flight.sqlmodel_update(new_data)
    session.add(flight)
    session.commit()
    session.refresh(flight)
    return flight


@router.delete(
    "/{flight_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=Message,
)
def delete_flight(session: SessionDep, flight_id: str) -> Any:
    flight = session.get(Flight, flight_id)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")

    session.delete(flight)
    session.commit()
    return Message(msg="Flight deleted successfully")
