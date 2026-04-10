"""Pydantic request/response schemas for the VM API."""

import uuid
from dataclasses import dataclass
from datetime import datetime

from pydantic import BaseModel, Field

from app.models import VMPackage, VMUser


@dataclass
class VMFilterParams:
    """Common filter/sort parameters for VM listing and search."""

    network: str | None = None
    status: str | None = None
    os: str | None = None
    sort_by: str = "created_at"
    order: str = "desc"


class VMCreate(BaseModel):
    """Schema for creating a new virtual machine."""

    name: str = Field(min_length=1, max_length=100)
    cpu: int = Field(ge=1, le=128)
    ram: int = Field(ge=512, description="RAM in MB")
    disk: int = Field(ge=1, description="Disk in GB")
    os: str = "RHEL 9"
    network: str = Field(pattern=r"^(office|machine|test)$")
    status: str = Field(default="provisioning", pattern=r"^(provisioning|running|stopped|failed)$")
    users: list[VMUser] = []
    packages: list[VMPackage] = []


class VMUpdate(BaseModel):
    """Schema for partially updating a virtual machine."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    cpu: int | None = Field(default=None, ge=1, le=128)
    ram: int | None = Field(default=None, ge=512)
    disk: int | None = Field(default=None, ge=1)
    os: str | None = None
    network: str | None = Field(default=None, pattern=r"^(office|machine|test)$")
    status: str | None = Field(default=None, pattern=r"^(provisioning|running|stopped|failed)$")
    users: list[VMUser] | None = None
    packages: list[VMPackage] | None = None


class VMResponse(BaseModel):
    """Schema for a virtual machine in API responses."""

    id: uuid.UUID
    name: str
    cpu: int
    ram: int
    disk: int
    os: str
    network: str
    status: str
    users: list[VMUser]
    packages: list[VMPackage]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VMListResponse(BaseModel):
    """Paginated list of virtual machines."""

    items: list[VMResponse]
    total: int


class SearchResponse(BaseModel):
    """MeiliSearch search results for virtual machines."""

    items: list[VMResponse]
    total: int
    query: str
    processing_time_ms: int


class AutocompleteItem(BaseModel):
    """Lightweight VM suggestion for autocomplete."""

    id: str
    name: str
    network: str
    status: str
