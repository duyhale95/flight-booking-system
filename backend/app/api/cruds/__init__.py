from enum import Enum


class ViewFilter(str, Enum):
    """Filter option for view status."""

    ACTIVE = "active"
    DELETED = "deleted"
    ALL = "all"
