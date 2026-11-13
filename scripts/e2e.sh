#!/usr/bin/env bash
set -euo pipefail
compose=(docker compose -p lab-e2e -f docker-compose.e2e.yml)
cleanup() { "${compose[@]}" down -v; }
trap cleanup EXIT
"${compose[@]}" up -d --build
"${compose[@]}" exec api alembic upgrade head
E2E_BASE_URL=http://localhost:5174 E2E_API_URL=http://localhost:8001 npm --prefix frontend run test:e2e

