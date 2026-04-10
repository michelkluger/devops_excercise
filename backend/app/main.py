"""FastAPI application entrypoint with lifespan, CORS, and route registration."""

import logging
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import meilisearch.errors
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from requests.exceptions import ConnectionError as RequestsConnectionError
from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.models import VM
from app.routes import auth, packages, users, vms
from app.schemas import VMCreate
from app.services import search, vm_service
from app.services.mock_data import SEED_VMS, generate_mock_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None]:
    """Initialize database, mock data, and search index on startup."""
    create_db_and_tables()
    generate_mock_data()
    logger.info("Database tables created, mock data generated")

    # Seed demo VMs only when SEED_DB=1 and database is empty
    if os.environ.get("SEED_DB") == "1":
        with Session(engine) as session:
            existing = session.exec(select(VM)).first()
            if existing is None:
                for vm_data in SEED_VMS:
                    vm_service.create_vm(session, VMCreate.model_validate(vm_data))
                logger.info("Seeded %d PSI demo VMs", len(SEED_VMS))

    if search.is_available():
        try:
            search.setup_index()
            logger.info("MeiliSearch index configured")
        except (meilisearch.errors.MeilisearchError, RequestsConnectionError, OSError):
            logger.warning("MeiliSearch setup failed — search will be unavailable")
    else:
        logger.warning("MeiliSearch is not available — search endpoint will return 503")

    yield


app = FastAPI(
    title="VM Provisioning API",
    description="REST API for creating, editing, listing and deleting provisioned virtual machines",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(vms.router)
app.include_router(users.router)
app.include_router(packages.router)


@app.get("/api/health")
def health() -> dict[str, object]:
    """Return API health status including MeiliSearch availability."""
    return {
        "status": "ok",
        "meilisearch": search.is_available(),
    }
