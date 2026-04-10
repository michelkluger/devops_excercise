#!/usr/bin/env bash
set -e

echo ""
echo "  ┌──────────────────────────────────────────┐"
echo "  │   PSI VM Provisioning Interface           │"
echo "  │   Paul Scherrer Institute                 │"
echo "  └──────────────────────────────────────────┘"
echo ""

echo "  → Building and starting services..."
echo ""

docker compose up --build -d

echo ""
echo "  ✓ MeiliSearch  — running (internal)"
echo "  ✓ Backend API  — running (internal)"
echo "  ✓ Frontend     — http://localhost:3000"
echo ""
echo "  Open http://localhost:3000 in your browser."
echo ""
echo "  To view logs:   docker compose logs -f"
echo "  To stop:        docker compose down"
echo ""
