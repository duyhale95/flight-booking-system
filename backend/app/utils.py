import random
import string
import uuid
from datetime import datetime


def generate_unique_id() -> str:
    return str(uuid.uuid4())


def generate_booking_number() -> str:
    year = datetime.now().year
    code = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"BK{year}{code}"


def generate_ticket_number() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


def generate_seat_numbers(num_seats: int, num_seats_per_row: int = 6) -> list[str]:
    seat_numbers = []
    i = 0
    while i < num_seats:
        for j in range(num_seats_per_row):
            row = i // num_seats_per_row + 1
            col = chr(65 + j)
            seat_numbers.append(f"{row}{col}")

            i += 1
            if i >= num_seats:
                break

    return seat_numbers
