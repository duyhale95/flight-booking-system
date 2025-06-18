import json
import logging
import logging.config
import time
import uuid
from collections.abc import Callable, Generator
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Optional


def sanitize_email(email: str) -> str:
    """
    Sanitize email address to protect user privacy.

    Example: jv***@example.com
    """
    if not email or "@" not in email:
        return email

    username, domain = email.split("@", 1)

    return f"{username[0:2]}***@{domain}"


def sanitize_id(id_value: str) -> str:
    """
    Sanitize ID to show only first and last characters.

    Example: ab***yz for a UUID or other ID
    """
    if not id_value or len(id_value) <= 4:
        return id_value

    return f"{id_value[:2]}***{id_value[-2:]}"


def sanitize_data(
    data: Any, sanitize_fields: Optional[dict[str, Callable[[Any], Any]]] = None
) -> Any:
    """
    Sanitize potentially sensitive data in logs.

    Args:
        data: Data to sanitize
        sanitize_fields: Dict of field names and sanitize functions

    Returns:
        Sanitized data
    """
    default_sanitizers = {
        "email": sanitize_email,
        "password": lambda _: "******",
        "token": lambda _: "******",
        "id": sanitize_id,
        "user_id": sanitize_id,
        "passenger_id": sanitize_id,
        "flight_id": sanitize_id,
        "booking_id": sanitize_id,
        "ticket_id": sanitize_id,
        "seat_id": sanitize_id,
    }

    sanitizers = {**default_sanitizers}
    if sanitize_fields:
        sanitizers.update(sanitize_fields)

    if isinstance(data, dict):
        sanitized = {}
        for key, value in data.items():
            # Check if key needs to be sanitized
            for field, sanitizer in sanitizers.items():
                if field in key.lower():
                    sanitized[key] = sanitizer(value)
                    break
            else:
                # No sanitization needed for this key
                if isinstance(value, dict | list):
                    sanitized[key] = sanitize_data(value, sanitize_fields)
                else:
                    sanitized[key] = value
        return sanitized
    elif isinstance(data, list):
        return [sanitize_data(item, sanitize_fields) for item in data]
    else:
        return data


@contextmanager
def log_operation(
    logger: logging.Logger,
    operation: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    level: int = logging.INFO,
) -> Generator[dict[str, Any], None, None]:
    """
    Context manager for logging operations with timing and status.

    Args:
        logger: Logger to use
        operation: Operation being performed (e.g., "create", "update")
        resource_type: Type of resource being operated on (e.g., "user", "booking")
        resource_id: ID of the resource if available
        level: Logging level for start/end messages

    Yields:
        Context dict with operation_id for correlation
    """
    operation_id = str(uuid.uuid4())[:8]

    # Format resource information if available
    resource_info = ""
    if resource_type:
        resource_info = f" {resource_type}"
        if resource_id:
            safe_id = sanitize_id(resource_id)
            resource_info += f" {safe_id}"

    # Log operation start
    start_time = time.time()
    logger.log(level, f"Starting {operation}{resource_info} [op_id={operation_id}]")

    context = {
        "operation_id": operation_id,
        "operation": operation,
        "resource_type": resource_type,
        "resource_id": resource_id,
    }

    try:
        yield context
        # Log successful completion
        elapsed = (time.time() - start_time) * 1000
        logger.log(
            level,
            f"Completed {operation}{resource_info} in {elapsed:.2f}ms "
            f"[op_id={operation_id}]",
        )
    except Exception as e:
        # Log failure
        elapsed = (time.time() - start_time) * 1000
        logger.error(
            f"Failed {operation}{resource_info} after {elapsed:.2f}ms: {e} "
            f"[op_id={operation_id}]",
            exc_info=True,
        )
        raise


def setup_logging() -> None:
    """
    Setup application logging from configuration.
    """
    # Create logs directory
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    # Load configuration from JSON file
    config_path = Path(__file__).parent.parent / "core" / "logging_config.json"

    if config_path.exists():
        with open(config_path) as config_file:
            config = json.load(config_file)

        logging.config.dictConfig(config)

        app_logger = logging.getLogger("app")
        app_logger.info("Logging configured successfully")
    else:
        app_logger = logging.getLogger("app")
        handler = logging.StreamHandler()
        handler.setFormatter(
            logging.Formatter("%(asctime)s - %(levelname)s - %(name)s - %(message)s")
        )
        app_logger.addHandler(handler)
        app_logger.setLevel(logging.INFO)
        app_logger.propagate = False
        app_logger.warning("Logging configuration file not found at %s", config_path)
