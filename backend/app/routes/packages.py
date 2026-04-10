"""Mock RPM package repository listing endpoint."""

from fastapi import APIRouter

from app.services.mock_data import RPM_PACKAGES

router = APIRouter(prefix="/api/packages", tags=["packages"])


@router.get("")
def list_packages() -> list[dict]:
    """Return all mock RPM packages."""
    return RPM_PACKAGES
