import random
import string
import uuid
from datetime import datetime


def generate_unique_id() -> str:
    return str(uuid.uuid4())


def generate_booking_number() -> str:
    year = datetime.now().year
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"BK{year}{code}"


def generate_ticket_number() -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

