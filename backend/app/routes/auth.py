"""Authentication and user info endpoints."""

from fastapi import APIRouter

from app.auth import UserDep
from app.services.mock_data import ROLE_PERMISSIONS, SYSTEM_USERS

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me")
def get_me(user: UserDep) -> dict:
    """Return the current user's profile and permissions."""
    return {
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "department": user.department,
        "permissions": sorted(ROLE_PERMISSIONS.get(user.role, set())),
    }


@router.get("/users")
def list_system_users() -> list[dict]:
    """Return all system users available for impersonation."""
    return SYSTEM_USERS
