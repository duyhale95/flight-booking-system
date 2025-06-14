import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends

from app.api.deps import CurrentUser, SessionDep, get_current_superuser
from app.core.exceptions import PassengerError, handle_exception
from app.cruds import booking_crud, passenger_crud
from app.schemas import (
    Message,
    PassengerCreate,
    PassengerPublic,
    PassengersPublic,
    PassengerUpdate,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/passengers", tags=["passengers"])


@router.get("", response_model=PassengersPublic)
def read_passengers(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 10,
    booking_id: Optional[str] = None,
) -> Any:
    try:
        logger.info("Retrieving passengers with filters")

        if booking_id:
            booking = booking_crud.get_by_id(session, booking_id)

            # Check if user has access to this booking
            booking_crud.verify_user_can_access_booking(booking, current_user)

            passengers, count = passenger_crud.get_passengers_by_booking(
                session, booking_id, skip, limit
            )
        elif current_user.is_superuser:
            passengers, count = passenger_crud.get_all_passengers(session, skip, limit)
        else:
            passengers, count = [], 0

        return {"data": passengers, "count": count}

    except PassengerError as e:
        logger.error(f"Error reading passengers: {str(e)}")
        raise handle_exception(e) from e


@router.post("", response_model=PassengerPublic)
def create_passenger(
    session: SessionDep,
    current_user: CurrentUser,
    passenger_in: PassengerCreate,
) -> Any:
    try:
        logger.info("Creating passenger")

        booking = booking_crud.get_by_id(session, passenger_in.booking_id)

        # Check if user has access to this booking
        booking_crud.verify_user_can_access_booking(booking, current_user)

        passenger_db = passenger_crud.create(session, passenger_in)

        logger.info(f"Passenger created successfully: {passenger_db.id}")
        return passenger_db

    except PassengerError as e:
        logger.error(f"Error creating passenger: {str(e)}")
        raise handle_exception(e) from e


@router.get("/{passenger_id}", response_model=PassengerPublic)
def read_passenger(
    session: SessionDep, current_user: CurrentUser, passenger_id: str
) -> Any:
    try:
        logger.info(f"Retrieving passenger with ID: {passenger_id}")

        passenger_db = passenger_crud.get_by_id(session, passenger_id)

        # Check if user has access to this passenger
        passenger_crud.verify_user_can_access_passenger(
            session, passenger_db, current_user
        )

        logger.info(f"Passenger retrieved successfully: {passenger_db.id}")
        return passenger_db

    except PassengerError as e:
        logger.error(f"Error retrieving passenger: {str(e)}")
        raise handle_exception(e) from e


@router.patch("/{passenger_id}", response_model=PassengerPublic)
def update_passenger(
    session: SessionDep,
    current_user: CurrentUser,
    passenger_id: str,
    passenger_in: PassengerUpdate,
) -> Any:
    try:
        logger.info(f"Updating passenger with ID: {passenger_id}")

        passenger_db = passenger_crud.get_by_id(session, passenger_id)

        # Check if user has access to this passenger
        passenger_crud.verify_user_can_access_passenger(
            session, passenger_db, current_user
        )

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
    try:
        logger.info(f"Deleting passenger with ID: {passenger_id}")

        passenger_db = passenger_crud.get_by_id(session, passenger_id)

        passenger_crud.delete(session, passenger_db)

        logger.info(f"Passenger deleted successfully: {passenger_id}")
        return Message(msg="Passenger deleted successfully")

    except PassengerError as e:
        logger.error(f"Error deleting passenger: {str(e)}")
        raise handle_exception(e) from e
