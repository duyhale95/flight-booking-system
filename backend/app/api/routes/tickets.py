import logging
from typing import Any

from fastapi import APIRouter, Depends

from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_superuser,
    get_current_user,
)
from app.core.exceptions import TicketError, handle_exception
from app.cruds import ticket_crud
from app.schemas import Message, TicketCreate, TicketPublic, TicketsPublic, TicketUpdate

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("", response_model=TicketsPublic)
def read_tickets(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    try:
        logger.info("Retrieving tickets with filters")

        if current_user.is_superuser:
            tickets, count = ticket_crud.get_all_tickets(session, skip, limit)
        else:
            # TODO: Implement getting passenger_id from current_user
            tickets, count = [], 0

        return {"data": tickets, "count": count}

    except TicketError as e:
        logger.error(f"Error reading tickets: {str(e)}")
        raise handle_exception(e) from e


@router.post("", dependencies=[Depends(get_current_user)], response_model=TicketPublic)
def create_ticket(session: SessionDep, ticket_in: TicketCreate) -> Any:
    try:
        logger.info(
            f"Creating ticket for passenger {ticket_in.passenger_id} "
            f"on flight {ticket_in.flight_id}"
        )

        ticket_db = ticket_crud.create(session, ticket_in)

        logger.info(f"Ticket created successfully: {ticket_db.id}")
        return ticket_db

    except TicketError as e:
        logger.error(f"Error creating ticket: {str(e)}")
        raise handle_exception(e) from e


@router.get(
    "/{ticket_id}",
    dependencies=[Depends(get_current_user)],
    response_model=TicketPublic,
)
def read_ticket(session: SessionDep, ticket_id: str) -> Any:
    try:
        logger.info(f"Retrieving ticket with ID: {ticket_id}")

        ticket_db = ticket_crud.get_by_id(session, ticket_id)

        logger.info(f"Ticket retrieved successfully: {ticket_db.id}")
        return ticket_db

    except TicketError as e:
        logger.error(f"Error retrieving ticket: {str(e)}")
        raise handle_exception(e) from e


@router.patch(
    "/{ticket_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=TicketPublic,
)
def update_ticket(session: SessionDep, ticket_id: str, ticket_in: TicketUpdate) -> Any:
    try:
        logger.info(f"Updating ticket with ID: {ticket_id}")

        ticket_db = ticket_crud.get_by_id(session, ticket_id)
        updated_ticket = ticket_crud.update(session, ticket_db, ticket_in)

        logger.info(f"Ticket updated successfully: {ticket_id}")
        return updated_ticket

    except TicketError as e:
        logger.error(f"Error updating ticket: {str(e)}")
        raise handle_exception(e) from e


@router.delete(
    "/{ticket_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=Message,
)
def delete_ticket(session: SessionDep, ticket_id: str) -> Any:
    try:
        logger.info(f"Deleting ticket with ID: {ticket_id}")

        ticket_db = ticket_crud.get_by_id(session, ticket_id)
        ticket_crud.delete(session, ticket_db)

        logger.info(f"Ticket deleted successfully: {ticket_id}")
        return Message(msg="Ticket deleted successfully")

    except TicketError as e:
        logger.error(f"Error deleting ticket: {str(e)}")
        raise handle_exception(e) from e
