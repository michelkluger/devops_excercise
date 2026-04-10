"""Role-based access control via X-User header.

Global roles (admin, operator, viewer) control what actions a user can perform.
Per-VM tenancy (where only assigned users can modify specific machines) is not
implemented in this demo but would be the natural next step for production use.
"""

from collections.abc import Callable
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Header, HTTPException

from app.services.mock_data import ROLE_PERMISSIONS, SYSTEM_USERS


@dataclass
class CurrentUser:
    """The authenticated user extracted from the X-User header."""

    username: str
    full_name: str
    role: str
    department: str

    def has_permission(self, action: str) -> bool:
        """Check if user's role grants a specific action."""
        return action in ROLE_PERMISSIONS.get(self.role, set())


def get_current_user(
    x_user: Annotated[str, Header()] = "a.mueller",
) -> CurrentUser:
    """Resolve the current user from the X-User header."""
    for user in SYSTEM_USERS:
        if user["username"] == x_user:
            return CurrentUser(**user)
    raise HTTPException(status_code=401, detail=f"Unknown user: {x_user}")


UserDep = Annotated[CurrentUser, Depends(get_current_user)]


def _require(action: str) -> Callable[..., CurrentUser]:
    """Return a dependency that checks a specific permission."""

    def check(user: UserDep) -> CurrentUser:
        if not user.has_permission(action):
            raise HTTPException(
                status_code=403,
                detail=f"User '{user.username}' ({user.role}) lacks '{action}' permission",
            )
        return user

    return check


RequireCreate = Annotated[CurrentUser, Depends(_require("create"))]
RequireEdit = Annotated[CurrentUser, Depends(_require("edit"))]
RequireDelete = Annotated[CurrentUser, Depends(_require("delete"))]
RequireStop = Annotated[CurrentUser, Depends(_require("stop"))]
RequireStart = Annotated[CurrentUser, Depends(_require("start"))]
RequireReboot = Annotated[CurrentUser, Depends(_require("reboot"))]
