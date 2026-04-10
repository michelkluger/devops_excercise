# VM Provisioning Interface

A web-based interface plus a Python REST API to create, edit, list and delete "provisioned" virtual machines.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.13 · FastAPI · SQLModel · SQLite |
| Search | MeiliSearch (Docker) |
| Frontend | React 19 · TypeScript · Vite · shadcn/ui · TanStack Query |
| Package managers | uv (Python) · bun (JS) |

## Quick Start (Docker — one command)

The fastest way to run everything. Only requires [Docker](https://docs.docker.com/get-docker/).

```bash
./start.sh        # Linux / macOS
start.bat         # Windows
```

Or directly:

```bash
docker compose up --build
```

Open `http://localhost:3000`. That's it — MeiliSearch, backend, and frontend are all running with 12 demo PSI VMs seeded automatically.

## Local Development

For development with hot reload. Requires [Docker](https://docs.docker.com/get-docker/), [uv](https://docs.astral.sh/uv/), and [bun](https://bun.sh/).

```bash
make setup   # install all dependencies
make dev     # start MeiliSearch, backend (port 8000), frontend (port 5173)
```

Or step by step:

### 1. Start MeiliSearch

```bash
cd backend && docker compose up -d
```

### 2. Start the Backend

```bash
cd backend
SEED_DB=1 uv run uvicorn app.main:app --reload --port 8000
```

Set `SEED_DB=1` on first run to populate the database with 12 demo VMs. Omit it on subsequent runs — seeding only occurs when the database is empty.

API at `http://localhost:8000` — interactive docs at `http://localhost:8000/docs`.

### 3. Start the Frontend

```bash
cd frontend && bun dev
```

UI at `http://localhost:5173`.

### 4. Run Tests

```bash
cd backend && uv run pytest tests/ -v
```

### 5. Lint

```bash
make lint   # ruff + ty + eslint + tsc
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/vms` | List VMs (filter: `?network=`, sort: `?sort_by=&order=`) |
| `POST` | `/api/vms` | Create a new VM |
| `GET` | `/api/vms/{id}` | Get a single VM |
| `PUT` | `/api/vms/{id}` | Update a VM |
| `DELETE` | `/api/vms/{id}` | Delete a VM |
| `GET` | `/api/vms/search` | Full-text search (`?q=&network=&limit=&offset=`) |
| `GET` | `/api/users` | List mock AD users |
| `GET` | `/api/packages` | List mock RPM packages |
| `GET` | `/api/health` | Health check (includes MeiliSearch status) |

## Design Notes

### Architecture

**Monorepo** with clearly separated `backend/` and `frontend/` directories. Each has its own dependency management and can be developed independently.

### Backend

- **FastAPI** for automatic OpenAPI docs, type validation via Pydantic, and async-ready architecture.
- **SQLModel** bridges SQLAlchemy and Pydantic — the same model validates API input and maps to the database.
- **SQLite** as the datastore — zero-config, file-based, sufficient for this scope. The schema uses JSON columns for users and packages to avoid join table complexity.
- **MeiliSearch** for full-text search with typo tolerance, faceted filtering, and sub-millisecond query times. Synced from SQLite on every mutation. The app gracefully degrades if MeiliSearch is unavailable.
- **Faker** generates 50 mock AD users and 100 RPM packages on startup with a fixed seed for reproducibility.

### Frontend

- **React + TypeScript + Vite** for type safety and fast HMR.
- **shadcn/ui** for accessible, composable UI components — not a dependency, components are copied into the project and can be customized.
- **TanStack Query** manages server state with automatic caching, background refetching, and optimistic updates.
- **react-hook-form + zod** for performant, schema-validated forms with minimal re-renders.
- The **DataTable** shows VMs with sortable columns and color-coded badges for network and status.
- A **Sheet** (slide-over panel) provides the create/edit form with dynamic user selection (from AD) with sudo toggles, and package selection (from RPM repo) via searchable comboboxes.
- The **search bar** queries MeiliSearch in real-time with debounced input, falling back to the standard list endpoint if search is empty.

### Mocked Interfaces

External dependencies are fully mocked:
- **Active Directory** — Faker-generated users with username, full name, email, and department
- **RPM Repository** — 100 real-world package names with randomly generated versions
- **Virtualization layer** — No real VMs are created; CRUD operations persist to SQLite

### Observability

The backend includes structured logging for key events:
- VM lifecycle (create, update, delete, status transitions)
- Auth decisions (access denied, unknown user)
- MeiliSearch connectivity (setup, fallback triggers)
- Background provisioning (success, failure, skips)

In production this would feed into a centralized logging stack (ELK/Loki) and an **event audit log** — a dedicated append-only table recording who did what to which VM and when, queryable for compliance and debugging.

### What I'd Add with More Time

- **Event audit log** — persist every mutation (create, edit, delete, stop, start) with user, timestamp, and diff to a dedicated table, exposed via a `/api/vms/{id}/events` endpoint and a timeline view in the UI
- **WebSocket updates** for real-time VM status changes instead of polling
- **Per-VM tenancy** — only assigned users can modify specific machines (the data model already supports this via the users field)
- Bulk operations (delete/start/stop multiple VMs)
- E2E tests with Playwright
- OpenTelemetry tracing for request-level observability
