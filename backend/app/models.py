"""SQLModel database models for VM provisioning."""

import json
import uuid
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel
from sqlalchemy import Column, Dialect
from sqlalchemy import types as sa_types
from sqlmodel import Field, SQLModel


class JSONType(sa_types.TypeDecorator[str]):
    """SQLite-compatible JSON column that serializes to/from Python objects."""

    impl = sa_types.Text
    cache_ok = True

    def process_bind_param(self, value: str | None, dialect: Dialect) -> str | None:
        """Serialize Python object to JSON string for storage."""
        if value is not None:
            return json.dumps(value)
        return None

    def process_result_value(self, value: Any, dialect: Dialect) -> str | None:
        """Deserialize JSON string back to Python object."""
        if value is not None:
            return json.loads(value)  # type: ignore[return-value]
        return None


class VMUser(BaseModel):
    """A user assigned to a virtual machine."""

    username: str
    full_name: str
    is_sudoer: bool = False


class VMPackage(BaseModel):
    """An RPM package installed on a virtual machine."""

    name: str
    version: str


def _utcnow() -> datetime:
    return datetime.now(UTC)


class VM(SQLModel, table=True):
    """Virtual machine database model."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True, unique=True)
    cpu: int = Field(ge=1, le=128)
    ram: int = Field(ge=512, description="RAM in MB")
    disk: int = Field(ge=1, description="Disk in GB")
    os: str = Field(default="RHEL 9")
    network: str = Field(default="office")
    status: str = Field(default="provisioning")
    users: list[dict] | None = Field(default=[], sa_column=Column(JSONType))
    packages: list[dict] | None = Field(default=[], sa_column=Column(JSONType))
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
