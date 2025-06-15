import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends

from app.api.deps import SessionDep, get_current_superuser
from app.core.exceptions import BookingError, PassengerError, handle_exception
from app.cruds import booking_crud, passenger_crud
from app.domain.schemas import (
    Message,
    PassengerCreate,
    PassengerPublic,
    PassengersPublic,
    PassengerUpdate,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/passengers", tags=["passengers"])


@router.get(
    "", dependencies=[Depends(get_current_superuser)], response_model=PassengersPublic
)
def read_passengers(
    session: SessionDep,
    skip: int = 0,
    limit: int = 10,
    booking_id: Optional[str] = None,
) -> Any:
    """
    Retrieve passengers with filters (admin only).
    """
    try:
        logger.info("Retrieving passengers with filters")

        if booking_id:
            passengers, count = passenger_crud.get_passengers_by_booking(
                session, booking_id, skip, limit
            )
        else:
            passengers, count = passenger_crud.get_all_passengers(session, skip, limit)
        return {"data": passengers, "count": count}

    except PassengerError as e:
        logger.error(f"Error reading passengers: {str(e)}")
        raise handle_exception(e) from e


@router.post(
    "", dependencies=[Depends(get_current_superuser)], response_model=PassengerPublic
)
def create_passenger(session: SessionDep, passenger_in: PassengerCreate) -> Any:
    """
    Create a passenger directly (admin only).
    """
    logger.info(
        f"Admin creating passenger directly for booking ID: {passenger_in.booking_id}"
    )

    try:
        # Verify the booking exists
        booking_crud.get_by_id(session, passenger_in.booking_id)

        passenger_db = passenger_crud.create(session, passenger_in)

        logger.info(f"Passenger created successfully: {passenger_db.id}")
        return passenger_db

    except (PassengerError, BookingError) as e:
        logger.error(f"Error creating passenger: {str(e)}")
        raise handle_exception(e) from e


@router.get(
    "/{passenger_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=PassengerPublic,
)
def read_passenger(session: SessionDep, passenger_id: str) -> Any:
    """
    Retrieve a specific passenger (admin only).
    """
    logger.info(f"Retrieving passenger with ID: {passenger_id}")

    try:
        passenger_db = passenger_crud.get_by_id(session, passenger_id)

        logger.info(f"Passenger retrieved successfully: {passenger_db.id}")
        return passenger_db

    except PassengerError as e:
        logger.error(f"Error retrieving passenger: {str(e)}")
        raise handle_exception(e) from e


@router.patch(
    "/{passenger_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=PassengerPublic,
)
def update_passenger(
    session: SessionDep, passenger_id: str, passenger_in: PassengerUpdate
) -> Any:
    """
    Update a specific passenger (admin only).
    """
    logger.info(f"Updating passenger with ID: {passenger_id}")

    try:
        passenger_db = passenger_crud.get_by_id(session, passenger_id)
        updated_passenger = passenger_crud.update(session, passenger_db, passenger_in)

        logger.info(f"Passenger updated successfully: {passenger_id}")
        return updated_passenger

    except PassengerError as e:
        logger.error(f"Error updating passenger: {str(e)}")
        raise handle_exception(e) from e


@router.delete(
    "/{passenger_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=Message,
)
def delete_passenger(session: SessionDep, passenger_id: str) -> Any:
    """
    Delete a passenger (admin only).
    """
    logger.info(f"Deleting passenger with ID: {passenger_id}")

    try:
        passenger_db = passenger_crud.get_by_id(session, passenger_id)
        passenger_crud.delete(session, passenger_db)

        logger.info(f"Passenger deleted successfully: {passenger_id}")
        return Message(msg="Passenger deleted successfully")

    except PassengerError as e:
        logger.error(f"Error deleting passenger: {str(e)}")
        raise handle_exception(e) from e
