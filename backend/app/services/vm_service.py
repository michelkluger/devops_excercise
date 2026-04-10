"""Business logic for VM CRUD operations."""

import contextlib
import logging
from datetime import UTC, datetime

from sqlmodel import Session, select

from app.models import VM
from app.schemas import VMCreate, VMFilterParams, VMUpdate
from app.services import search

logger = logging.getLogger(__name__)


def list_vms(session: Session, params: VMFilterParams) -> list[VM]:
    """Return all VMs, optionally filtered and sorted."""
    statement = select(VM)

    if params.network:
        statement = statement.where(VM.network == params.network)
    if params.status:
        statement = statement.where(VM.status == params.status)
    if params.os:
        statement = statement.where(VM.os == params.os)

    allowed_sort = {"name", "cpu", "ram", "disk", "created_at", "updated_at", "os", "status"}
    if params.sort_by in allowed_sort:
        col = getattr(VM, params.sort_by)
        statement = statement.order_by(col.desc() if params.order == "desc" else col.asc())

    return list(session.exec(statement).all())


def create_vm(session: Session, data: VMCreate) -> VM:
    """Create a new VM and sync it to the search index."""
    vm = VM(**data.model_dump(mode="json"))
    session.add(vm)
    session.commit()
    session.refresh(vm)

    _sync_to_search(vm)
    logger.info("VM created: %s (cpu=%d, ram=%d, network=%s)", vm.name, vm.cpu, vm.ram, vm.network)
    return vm


def update_vm(session: Session, vm: VM, data: VMUpdate) -> VM:
    """Update an existing VM and sync changes to the search index."""
    update_data = data.model_dump(exclude_unset=True, mode="json")
    changed_fields = list(update_data.keys())
    for key, value in update_data.items():
        setattr(vm, key, value)
    vm.updated_at = datetime.now(UTC)

    session.add(vm)
    session.commit()
    session.refresh(vm)

    _sync_to_search(vm)
    logger.info("VM updated: %s (fields: %s)", vm.name, ", ".join(changed_fields))
    return vm


def set_status(session: Session, vm: VM, status: str) -> VM:
    """Change VM status and sync to search."""
    old_status = vm.status
    vm.status = status
    vm.updated_at = datetime.now(UTC)
    session.add(vm)
    session.commit()
    session.refresh(vm)
    _sync_to_search(vm)
    logger.info("VM status changed: %s (%s -> %s)", vm.name, old_status, status)
    return vm


def delete_vm(session: Session, vm: VM) -> None:
    """Delete a VM and remove it from the search index."""
    vm_id = str(vm.id)
    vm_name = vm.name
    session.delete(vm)
    session.commit()

    with contextlib.suppress(Exception):
        search.delete_vm_from_index(vm_id)
    logger.info("VM deleted: %s (%s)", vm_name, vm_id)


def _sync_to_search(vm: VM) -> None:
    """Push VM data to MeiliSearch, silently ignoring failures."""
    with contextlib.suppress(Exception):
        vm_dict = {
            "id": str(vm.id),
            "name": vm.name,
            "cpu": vm.cpu,
            "ram": vm.ram,
            "disk": vm.disk,
            "os": vm.os,
            "network": vm.network,
            "status": vm.status,
            "users": vm.users or [],
            "packages": vm.packages or [],
            "created_at": vm.created_at.isoformat() if vm.created_at else None,
            "updated_at": vm.updated_at.isoformat() if vm.updated_at else None,
        }
        search.index_vm(vm_dict)
