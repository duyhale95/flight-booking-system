import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query

from app.api.cruds import flight_crud
from app.api.deps import SessionDep, get_current_superuser
from app.common.exceptions import FlightError, handle_exception
from app.domain.schemas import (
    FlightCreate,
    FlightPublic,
    FlightSearch,
    FlightsPublic,
    FlightUpdate,
    Message,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/flights", tags=["flights"])


@router.get("", response_model=FlightsPublic)
def read_flights(session: SessionDep, search: Annotated[FlightSearch, Query()]) -> Any:
    """
    Retrieve flights with filters.
    """
    logger.info("Retrieving flights with filters")

    flights, count = flight_crud.search_flights(session, search)
    return {"data": flights, "count": count}


@router.post(
    "",
    dependencies=[Depends(get_current_superuser)],
    response_model=FlightPublic,
)
def create_flight(session: SessionDep, flight_in: FlightCreate) -> Any:
    """
    Create a new flight and associated seats (admin only).
    """
    try:
        logger.info(f"Creating flight with number: {flight_in.flight_number}")

        flight_db = flight_crud.create_with_seats(session, flight_in)

        logger.info(f"Flight created successfully: {flight_db.id}")
        return flight_db

    except FlightError as e:
        logger.error(f"Error creating flight: {str(e)}")
        raise handle_exception(e) from e


@router.get("/{flight_id}", response_model=FlightPublic)
def read_flight(session: SessionDep, flight_id: str) -> Any:
    """
    Retrieve a flight by ID.
    """
    try:
        logger.info(f"Retrieving flight with ID: {flight_id}")

        flight_db = flight_crud.get_by_id(session, flight_id)

        logger.info(f"Flight retrieved successfully: {flight_db.id}")
        return flight_db

    except FlightError as e:
        logger.error(f"Error retrieving flight: {str(e)}")
        raise handle_exception(e) from e


@router.patch(
    "/{flight_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=FlightPublic,
)
def update_flight(session: SessionDep, flight_id: str, flight_in: FlightUpdate) -> Any:
    """
    Update a flight by ID (admin only).
    """
    try:
        logger.info(f"Updating flight with ID: {flight_id}")

        flight_db = flight_crud.get_by_id(session, flight_id)
        updated_flight = flight_crud.update(session, flight_db, flight_in)

        logger.info(f"Flight updated successfully: {flight_id}")
        return updated_flight

    except FlightError as e:
        logger.error(f"Error updating flight: {str(e)}")
        raise handle_exception(e) from e


@router.delete(
    "/{flight_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=Message,
)
def delete_flight(session: SessionDep, flight_id: str) -> Any:
    """
    Delete a flight by ID (admin only).
    """
    try:
        flight_db = flight_crud.get_by_id(session, flight_id)

        flight_crud.delete(session, flight_db)

        logger.info(f"Flight deleted successfully: {flight_id}")
        return Message(msg="Flight deleted successfully")

    except FlightError as e:
        logger.error(f"Error deleting flight: {str(e)}")
        raise handle_exception(e) from e
