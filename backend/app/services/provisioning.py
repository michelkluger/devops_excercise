"""Background provisioning simulation for newly created VMs."""

import contextlib
import logging
import random
import time
import uuid

import meilisearch.errors
from requests.exceptions import ConnectionError as RequestsConnectionError
from sqlmodel import Session

from app.database import engine
from app.models import VM
from app.services import search

logger = logging.getLogger(__name__)
_rng = random.SystemRandom()

PROVISION_DELAY_SECONDS = 10
FAILURE_PROBABILITY = 0.1


def simulate_provisioning(vm_id: uuid.UUID) -> None:
    """Simulate VM provisioning with a delay, then transition to running or failed."""
    time.sleep(PROVISION_DELAY_SECONDS)

    with Session(engine) as session:
        vm = session.get(VM, vm_id)
        if not vm:
            logger.warning("VM %s no longer exists, skipping provisioning", vm_id)
            return

        if vm.status != "provisioning":
            logger.info("VM %s status is '%s', skipping provisioning", vm.name, vm.status)
            return

        if _rng.random() < FAILURE_PROBABILITY:
            vm.status = "failed"
            logger.warning("VM %s failed to provision", vm.name)
        else:
            vm.status = "running"
            logger.info("VM %s provisioned successfully", vm.name)

        session.add(vm)
        session.commit()
        session.refresh(vm)

        _sync_status_to_search(vm)


def _sync_status_to_search(vm: VM) -> None:
    """Update the VM status in MeiliSearch after provisioning."""
    with contextlib.suppress(meilisearch.errors.MeilisearchError, RequestsConnectionError, OSError):
        search.index_vm(
            {
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
        )
