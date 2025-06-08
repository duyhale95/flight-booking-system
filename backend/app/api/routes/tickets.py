from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_superuser,
    get_current_user,
)
from app.models import Seat, Ticket
from app.schemas import Message, TicketCreate, TicketPublic, TicketsPublic, TicketUpdate

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("", response_model=TicketsPublic)
def read_tickets(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    statement = select(Ticket)

    if not current_user.is_superuser:
        statement = statement.where(Ticket.passenger_id == current_user.id)

    # Get total count
    count_statement = select(func.count()).select_from(statement)
    count = session.exec(count_statement).one()

    # Apply pagination
    statement = statement.offset(skip).limit(limit)
    tickets = session.exec(statement).all()

    return {"data": tickets, "count": count}


@router.post("", dependencies=[Depends(get_current_user)], response_model=TicketPublic)
def create_ticket(
    session: SessionDep,
    ticket_in: TicketCreate,
) -> Any:
    if ticket_in.seat_id:
        seat_db = session.get(Seat, ticket_in.seat_id)
        if not seat_db:
            raise HTTPException(status_code=404, detail="Seat not found")
        if not seat_db.is_available:
            raise HTTPException(status_code=400, detail="Seat is already taken")

        # Mark seat as unavailable
        seat_db.is_available = False
        session.add(seat_db)

    else:
        statement = select(Seat).where(
            Seat.flight_id == ticket_in.flight_id,
            Seat.is_available is True,
        )
        seat_db = session.exec(statement).first()
        if not seat_db:
            raise HTTPException(status_code=400, detail="No available seats")

    ticket_db = Ticket.model_validate(ticket_in)
    session.add(ticket_db)
    session.commit()
    session.refresh(ticket_db)
    return ticket_db


@router.get(
    "/{ticket_id}",
    dependencies=[Depends(get_current_user)],
    response_model=TicketPublic,
)
def read_ticket(
    session: SessionDep,
    ticket_id: str,
) -> Any:
    ticket = session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.patch(
    "/{ticket_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=TicketPublic,
)
def update_ticket(
    session: SessionDep,
    ticket_id: str,
    ticket_in: TicketUpdate,
) -> Any:
    ticket_db = session.get(Ticket, ticket_id)
    if not ticket_db:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket_in.seat_id and ticket_in.seat_id != ticket_db.seat_id:
        new_seat = session.get(Seat, ticket_in.seat_id)
        if not new_seat:
            raise HTTPException(status_code=404, detail="Seat not found")
        if not new_seat.is_available:
            raise HTTPException(status_code=400, detail="Seat is already taken")

        # Mark new seat as unavailable
        new_seat.is_available = False
        session.add(new_seat)

        old_seat = session.get(Seat, ticket_db.seat_id)
        old_seat.is_available = True
        session.add(old_seat)

    new_data = ticket_in.model_dump(exclude_unset=True)
    ticket_db.sqlmodel_update(new_data)
    session.add(ticket_db)
    session.commit()
    session.refresh(ticket_db)
    return ticket_db


@router.delete(
    "/{ticket_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=Message,
)
def delete_ticket(
    session: SessionDep,
    ticket_id: str,
) -> Any:
    ticket = session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    seat = session.get(Seat, ticket.seat_id)
    seat.is_available = True
    session.add(seat)

    session.delete(ticket)
    session.commit()
    return Message(msg="Ticket deleted successfully")
