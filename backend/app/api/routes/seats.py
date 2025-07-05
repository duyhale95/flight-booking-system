import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends

from app.api.cruds import seat_crud
from app.api.deps import CurrentUser, SessionDep, get_current_superuser
from app.common.exceptions import SeatError, SeatNotAvailableError, handle_exception
from app.domain.schemas import Message, SeatCreate, SeatPublic, SeatsPublic, SeatUpdate

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/seats", tags=["seats"])


@router.get("", response_model=SeatsPublic)
def read_seats(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    flight_id: Optional[str] = None,
    available_only: bool = False,
) -> Any:
    """
    Retrieve seats with filters.
    """
    try:
        logger.info("Retrieving seats with filters")

        if flight_id:
            seats, count = seat_crud.get_seats_by_flight(
                session, flight_id, skip, limit, available_only
            )
        else:
            seats, count = seat_crud.get_all_seats(session, skip, limit, available_only)

        return {"data": seats, "count": count}

    except SeatError as e:
        logger.error(f"Error reading seats: {str(e)}")
        raise handle_exception(e) from e


@router.get("/flight/{flight_id}", response_model=SeatsPublic)
def read_seats_by_flight(
    session: SessionDep,
    flight_id: str,
    skip: int = 0,
    limit: int = 100,
    available_only: bool = False,
) -> Any:
    """
    Retrieve all seats for a specific flight.
    """
    try:
        logger.info(f"Retrieving seats for flight: {flight_id}")

        seats, count = seat_crud.get_seats_by_flight(
            session, flight_id, skip, limit, available_only
        )

        return {"data": seats, "count": count}

    except SeatError as e:
        logger.error(f"Error retrieving seats for flight {flight_id}: {str(e)}")
        raise handle_exception(e) from e


@router.post(
    "",
    dependencies=[Depends(get_current_superuser)],
    response_model=SeatPublic,
)
def create_seat(session: SessionDep, seat_in: SeatCreate) -> Any:
    """
    Create a new seat (admin only).
    """
    try:
        logger.info(
            f"Creating new seat {seat_in.seat_number} for flight {seat_in.flight_id}"
        )

        seat_db = seat_crud.create(session, seat_in)

        logger.info(f"Seat created successfully: {seat_db.id}")
        return seat_db

    except SeatError as e:
        logger.error(f"Error creating seat: {str(e)}")
        raise handle_exception(e) from e


@router.get("/{seat_id}", response_model=SeatPublic)
def read_seat(session: SessionDep, seat_id: str) -> Any:
    """
    Retrieve a seat by ID.
    """
    try:
        logger.info(f"Retrieving seat with ID: {seat_id}")

        seat_db = seat_crud.get_by_id(session, seat_id)

        logger.info(f"Seat retrieved successfully: {seat_db.id}")
        return seat_db

    except SeatError as e:
        logger.error(f"Error retrieving seat: {str(e)}")
        raise handle_exception(e) from e


@router.patch(
    "/{seat_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=SeatPublic,
)
def update_seat(session: SessionDep, seat_id: str, seat_in: SeatUpdate) -> Any:
    """
    Update a seat by ID (admin only).
    """
    try:
        logger.info(f"Updating seat with ID: {seat_id}")

        seat_db = seat_crud.get_by_id(session, seat_id)
        updated_seat = seat_crud.update(session, seat_db, seat_in)

        logger.info(f"Seat updated successfully: {seat_id}")
        return updated_seat

    except SeatError as e:
        logger.error(f"Error updating seat: {str(e)}")
        raise handle_exception(e) from e


@router.delete(
    "/{seat_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=Message,
)
def delete_seat(session: SessionDep, seat_id: str) -> Any:
    """
    Delete a seat by ID (admin only).
    """
    try:
        logger.info(f"Deleting seat with ID: {seat_id}")

        seat_db = seat_crud.get_by_id(session, seat_id)
        seat_crud.delete(session, seat_db)

        logger.info(f"Seat deleted successfully: {seat_id}")
        return Message(msg="Seat deleted successfully")

    except SeatError as e:
        logger.error(f"Error deleting seat: {str(e)}")
        raise handle_exception(e) from e


@router.post("/{seat_id}/reserve", response_model=SeatPublic)
def reserve_seat(session: SessionDep, seat_id: str, current_user: CurrentUser) -> Any:
    """
    Reserve a seat for the current user during booking process.
    This endpoint allows regular users to reserve a seat.
    """
    try:
        logger.info(f"User {current_user.id} reserving seat with ID: {seat_id}")

        seat_db = seat_crud.get_by_id(session, seat_id)

        # Check if seat is available
        if not seat_db.is_available:
            logger.error(f"Seat {seat_id} is not available")
            raise SeatNotAvailableError(seat_number=seat_db.seat_number)

        # Reserve the seat by updating is_available to False
        update_data = SeatUpdate(is_available=False)
        updated_seat = seat_crud.update(session, seat_db, update_data)

        logger.info(f"Seat {seat_id} reserved successfully by user {current_user.id}")
        return updated_seat

    except SeatError as e:
        logger.error(f"Error reserving seat: {str(e)}")
        raise handle_exception(e) from e
