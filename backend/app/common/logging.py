import json
import logging
import logging.config
from pathlib import Path


def setup_logging() -> None:
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
        app_logger.warning(f"Logging configuration file not found at {config_path}")
