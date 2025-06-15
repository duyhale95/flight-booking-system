import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends

from app.api.deps import SessionDep, get_current_superuser
from app.core.exceptions import SeatError, handle_exception
from app.cruds import seat_crud
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


@router.post(
    "",
    dependencies=[Depends(get_current_superuser)],
    response_model=SeatPublic,
)
def create_seat(session: SessionDep, seat_in: SeatCreate) -> Any:
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
    try:
        logger.info(f"Deleting seat with ID: {seat_id}")

        seat_db = seat_crud.get_by_id(session, seat_id)
        seat_crud.delete(session, seat_db)

        logger.info(f"Seat deleted successfully: {seat_id}")
        return Message(msg="Seat deleted successfully")

    except SeatError as e:
        logger.error(f"Error deleting seat: {str(e)}")
        raise handle_exception(e) from e
