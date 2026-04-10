"""Mock Active Directory user listing endpoint."""

from fastapi import APIRouter

from app.services.mock_data import AD_USERS

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("")
def list_users() -> list[dict]:
    """Return all mock AD users."""
    return AD_USERS
