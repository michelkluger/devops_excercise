"""CRUD and search endpoints for virtual machines."""

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query

from app.auth import RequireCreate, RequireDelete, RequireEdit, RequireReboot, RequireStart, RequireStop
from app.dependencies import SessionDep, VMDep
from app.schemas import (
    AutocompleteItem,
    SearchResponse,
    VMCreate,
    VMFilterParams,
    VMResponse,
    VMUpdate,
)
from app.services import search, vm_service
from app.services.provisioning import simulate_provisioning

router = APIRouter(prefix="/api/vms", tags=["vms"])

FiltersDep = Annotated[VMFilterParams, Depends()]


@router.get("")
def list_vms(
    session: SessionDep,
    filters: FiltersDep,
    q: Annotated[str, Query()] = "",
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> SearchResponse:
    """List and search VMs via MeiliSearch, falling back to SQLite if unavailable."""
    if search.is_available():
        results = search.search_vms(query=q, filters=filters, limit=limit, offset=offset)
        return SearchResponse(
            items=[VMResponse.model_validate(hit) for hit in results["hits"]],
            total=results["estimatedTotalHits"],
            query=results["query"],
            processing_time_ms=results["processingTimeMs"],
        )

    all_vms = vm_service.list_vms(session, filters)
    total = len(all_vms)
    page = all_vms[offset : offset + limit]
    return SearchResponse(
        items=[VMResponse.model_validate(vm) for vm in page],
        total=total,
        query=q,
        processing_time_ms=0,
    )


@router.get("/autocomplete")
def autocomplete_vms(
    q: Annotated[str, Query(min_length=1)],
    limit: Annotated[int, Query(ge=1, le=10)] = 5,
) -> list[AutocompleteItem]:
    """Return lightweight VM name suggestions for autocomplete."""
    if not search.is_available():
        return []
    hits = search.autocomplete(query=q, limit=limit)
    return [AutocompleteItem.model_validate(hit) for hit in hits]


@router.post("", status_code=201)
def create_vm(
    _user: RequireCreate,
    data: VMCreate,
    session: SessionDep,
    background_tasks: BackgroundTasks,
) -> VMResponse:
    """Create a new virtual machine and start background provisioning."""
    vm = vm_service.create_vm(session, data)
    if vm.status == "provisioning":
        background_tasks.add_task(simulate_provisioning, vm.id)
    return VMResponse.model_validate(vm)


@router.get("/{vm_id}")
def get_vm(vm_id: VMDep) -> VMResponse:
    """Get a single virtual machine by ID."""
    return VMResponse.model_validate(vm_id)


@router.put("/{vm_id}")
def update_vm(_user: RequireEdit, vm_id: VMDep, data: VMUpdate, session: SessionDep) -> VMResponse:
    """Update an existing virtual machine."""
    updated = vm_service.update_vm(session, vm_id, data)
    return VMResponse.model_validate(updated)


@router.post("/{vm_id}/stop")
def stop_vm(_user: RequireStop, vm_id: VMDep, session: SessionDep) -> VMResponse:
    """Stop a running virtual machine."""
    if vm_id.status not in ("running", "provisioning"):
        raise HTTPException(status_code=409, detail=f"Cannot stop VM in '{vm_id.status}' state")
    updated = vm_service.set_status(session, vm_id, "stopped")
    return VMResponse.model_validate(updated)


@router.post("/{vm_id}/start")
def start_vm(
    _user: RequireStart,
    vm_id: VMDep,
    session: SessionDep,
    background_tasks: BackgroundTasks,
) -> VMResponse:
    """Start a stopped or failed virtual machine."""
    if vm_id.status not in ("stopped", "failed"):
        raise HTTPException(status_code=409, detail=f"Cannot start VM in '{vm_id.status}' state")
    updated = vm_service.set_status(session, vm_id, "provisioning")
    background_tasks.add_task(simulate_provisioning, updated.id)
    return VMResponse.model_validate(updated)


@router.post("/{vm_id}/reboot")
def reboot_vm(
    _user: RequireReboot,
    vm_id: VMDep,
    session: SessionDep,
    background_tasks: BackgroundTasks,
) -> VMResponse:
    """Reboot a running virtual machine."""
    if vm_id.status != "running":
        raise HTTPException(status_code=409, detail=f"Cannot reboot VM in '{vm_id.status}' state")
    updated = vm_service.set_status(session, vm_id, "provisioning")
    background_tasks.add_task(simulate_provisioning, updated.id)
    return VMResponse.model_validate(updated)


@router.delete("/{vm_id}", status_code=204)
def delete_vm(_user: RequireDelete, vm_id: VMDep, session: SessionDep) -> None:
    """Delete a virtual machine. Admin only."""
    vm_service.delete_vm(session, vm_id)
