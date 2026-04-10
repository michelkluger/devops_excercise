"""Database engine and session management."""

import os
from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./vms.db")

engine = create_engine(DATABASE_URL, echo=False)


def create_db_and_tables() -> None:
    """Create all SQLModel tables in the database."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session]:
    """Yield a database session for dependency injection."""
    with Session(engine) as session:
        yield session
