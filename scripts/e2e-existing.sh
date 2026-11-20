#!/usr/bin/env bash
set -euo pipefail
E2E_BASE_URL=http://localhost:5173 E2E_API_URL=http://localhost:8000 npm --prefix frontend run test:e2e

