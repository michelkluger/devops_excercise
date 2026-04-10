"""Shared FastAPI dependencies."""

import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, Path
from sqlmodel import Session

from app.database import get_session
from app.models import VM

SessionDep = Annotated[Session, Depends(get_session)]


def get_vm_or_404(
    vm_id: Annotated[uuid.UUID, Path()],
    session: SessionDep,
) -> VM:
    """Fetch a VM by path parameter or raise 404."""
    vm = session.get(VM, vm_id)
    if not vm:
        raise HTTPException(status_code=404, detail="VM not found")
    return vm


VMDep = Annotated[VM, Depends(get_vm_or_404)]
