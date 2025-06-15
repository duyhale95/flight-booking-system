import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends

from app.api.cruds import passenger_crud, ticket_crud
from app.api.deps import SessionDep, get_current_superuser
from app.common.exceptions import PassengerError, TicketError, handle_exception
from app.domain.schemas import (
    Message,
    TicketCreate,
    TicketPublic,
    TicketsPublic,
    TicketUpdate,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get(
    "", dependencies=[Depends(get_current_superuser)], response_model=TicketsPublic
)
def read_tickets(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    flight_id: Optional[str] = None,
) -> Any:
    """
    Retrieve tickets with filters (admin only).
    """
    logger.info("Retrieving tickets with filters")

    try:
        if flight_id:
            tickets, count = ticket_crud.get_tickets_by_flight(
                session, flight_id, skip, limit
            )
        else:
            tickets, count = ticket_crud.get_all_tickets(session, skip, limit)

        return {"data": tickets, "count": count}

    except TicketError as e:
        logger.error(f"Error reading tickets: {str(e)}")
        raise handle_exception(e) from e


@router.post(
    "", dependencies=[Depends(get_current_superuser)], response_model=TicketPublic
)
def create_ticket(session: SessionDep, ticket_in: TicketCreate) -> Any:
    """
    Create a ticket directly (admin only).
    """
    try:
        logger.info(
            f"Admin creating ticket for passenger {ticket_in.passenger_id} "
            f"on flight {ticket_in.flight_id}"
        )

        # Verify the passenger exists
        passenger_crud.get_by_id(session, ticket_in.passenger_id)

        ticket_db = ticket_crud.create(session, ticket_in)

        logger.info(f"Ticket created successfully: {ticket_db.id}")
        return ticket_db

    except (TicketError, PassengerError) as e:
        logger.error(f"Error creating ticket: {str(e)}")
        raise handle_exception(e) from e


@router.get(
    "/{ticket_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=TicketPublic,
)
def read_ticket(session: SessionDep, ticket_id: str) -> Any:
    """
    Retrieve a specific ticket (admin only).
    """
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
    """
    Update a ticket (admin only).
    """
    logger.info(f"Updating ticket with ID: {ticket_id}")

    try:
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
    """
    Delete a ticket (admin only).
    """
    logger.info(f"Deleting ticket with ID: {ticket_id}")

    try:
        ticket_db = ticket_crud.get_by_id(session, ticket_id)
        ticket_crud.delete(session, ticket_db)

        logger.info(f"Ticket deleted successfully: {ticket_id}")
        return Message(msg="Ticket deleted successfully")

    except TicketError as e:
        logger.error(f"Error deleting ticket: {str(e)}")
        raise handle_exception(e) from e
