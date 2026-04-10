.PHONY: setup dev dev-backend dev-frontend dev-meili stop test lint clean

# One-command setup: install all dependencies
setup:
	cd backend && uv sync
	cd frontend && bun install

# One-command start: MeiliSearch + backend + frontend
dev: dev-meili dev-backend dev-frontend

dev-meili:
	cd backend && docker compose up -d

dev-backend:
	cd backend && SEED_DB=1 PYTHONIOENCODING=utf-8 uv run uvicorn app.main:app --reload --port 8000 &

dev-frontend:
	cd frontend && bun dev &

stop:
	cd backend && docker compose down
	-pkill -f "uvicorn app.main:app" 2>/dev/null || true
	-pkill -f "bun dev" 2>/dev/null || true

test:
	cd backend && uv run pytest tests/ -v

lint:
	cd backend && uv run ruff check && uv run ruff format --check && uv run ty check
	cd frontend && bun run lint && bunx tsc --noEmit

clean:
	rm -f backend/vms.db
	rm -rf frontend/dist frontend/.eslintcache
	cd backend && docker compose down -v
