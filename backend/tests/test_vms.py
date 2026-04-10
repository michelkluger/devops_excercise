"""Tests for VM CRUD endpoints, mock data endpoints, and health check."""

import uuid
from collections.abc import Generator
from http import HTTPStatus
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.database import get_session
from app.main import app
from app.services.mock_data import generate_mock_data

EXPECTED_AD_USER_COUNT = 50


@pytest.fixture(name="session")
def session_fixture() -> Generator[Session]:
    """Provide a clean in-memory SQLite session for each test."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session) -> Generator[TestClient]:
    """Provide a TestClient with an overridden database session."""
    generate_mock_data()

    def get_session_override() -> Generator[Session]:
        yield session

    app.dependency_overrides[get_session] = get_session_override
    with patch("app.services.search.is_available", return_value=False):
        client = TestClient(app)
        yield client
    app.dependency_overrides.clear()


VM_PAYLOAD: dict = {
    "name": "test-vm-01",
    "cpu": 4,
    "ram": 8192,
    "disk": 100,
    "os": "RHEL 9",
    "network": "office",
    "users": [{"username": "jdoe", "full_name": "John Doe", "is_sudoer": True}],
    "packages": [{"name": "nginx", "version": "1.24.0"}],
}


def test_create_vm(client: TestClient) -> None:
    """Verify that a VM can be created with all expected fields."""
    response = client.post("/api/vms", json=VM_PAYLOAD)
    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data["name"] == VM_PAYLOAD["name"]
    assert data["cpu"] == VM_PAYLOAD["cpu"]
    assert data["ram"] == VM_PAYLOAD["ram"]
    assert data["network"] == VM_PAYLOAD["network"]
    assert len(data["users"]) == 1
    assert data["users"][0]["is_sudoer"] is True
    assert len(data["packages"]) == 1
    assert data["id"] is not None


def test_list_vms(client: TestClient) -> None:
    """Verify listing returns all created VMs."""
    client.post("/api/vms", json=VM_PAYLOAD)
    client.post("/api/vms", json={**VM_PAYLOAD, "name": "test-vm-02", "network": "test"})

    response = client.get("/api/vms")
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    expected_count = 2
    assert data["total"] == expected_count
    assert len(data["items"]) == expected_count


def test_list_vms_filter_by_network(client: TestClient) -> None:
    """Verify filtering VMs by network type."""
    client.post("/api/vms", json=VM_PAYLOAD)
    client.post("/api/vms", json={**VM_PAYLOAD, "name": "test-vm-02", "network": "test"})

    response = client.get("/api/vms?network=test")
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["network"] == "test"


def test_get_vm(client: TestClient) -> None:
    """Verify fetching a single VM by ID."""
    create_resp = client.post("/api/vms", json=VM_PAYLOAD)
    vm_id = create_resp.json()["id"]

    response = client.get(f"/api/vms/{vm_id}")
    assert response.status_code == HTTPStatus.OK
    assert response.json()["name"] == VM_PAYLOAD["name"]


def test_get_vm_not_found(client: TestClient) -> None:
    """Verify 404 for a non-existent VM."""
    response = client.get(f"/api/vms/{uuid.uuid4()}")
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_update_vm(client: TestClient) -> None:
    """Verify partial update of a VM."""
    create_resp = client.post("/api/vms", json=VM_PAYLOAD)
    vm_id = create_resp.json()["id"]

    updated_cpu = 8
    updated_ram = 16384
    response = client.put(f"/api/vms/{vm_id}", json={"cpu": updated_cpu, "ram": updated_ram})
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["cpu"] == updated_cpu
    assert data["ram"] == updated_ram
    assert data["name"] == VM_PAYLOAD["name"]


def test_delete_vm(client: TestClient) -> None:
    """Verify deleting a VM removes it."""
    create_resp = client.post("/api/vms", json=VM_PAYLOAD)
    vm_id = create_resp.json()["id"]

    response = client.delete(f"/api/vms/{vm_id}")
    assert response.status_code == HTTPStatus.NO_CONTENT

    response = client.get(f"/api/vms/{vm_id}")
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_delete_vm_not_found(client: TestClient) -> None:
    """Verify 404 when deleting a non-existent VM."""
    response = client.delete(f"/api/vms/{uuid.uuid4()}")
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_create_vm_validation(client: TestClient) -> None:
    """Verify validation rejects invalid CPU count."""
    bad_payload = {**VM_PAYLOAD, "cpu": 0}
    response = client.post("/api/vms", json=bad_payload)
    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


def test_create_vm_invalid_network(client: TestClient) -> None:
    """Verify validation rejects invalid network type."""
    bad_payload = {**VM_PAYLOAD, "network": "invalid"}
    response = client.post("/api/vms", json=bad_payload)
    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


def test_list_users(client: TestClient) -> None:
    """Verify mock AD users are returned."""
    response = client.get("/api/users")
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert len(data) == EXPECTED_AD_USER_COUNT
    assert "username" in data[0]
    assert "full_name" in data[0]


def test_list_packages(client: TestClient) -> None:
    """Verify mock RPM packages are returned."""
    response = client.get("/api/packages")
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert len(data) > 0
    assert "name" in data[0]
    assert "version" in data[0]


def test_health(client: TestClient) -> None:
    """Verify health endpoint returns ok status."""
    response = client.get("/api/health")
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["status"] == "ok"
