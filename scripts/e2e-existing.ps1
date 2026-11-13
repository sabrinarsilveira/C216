$ErrorActionPreference = "Stop"
$env:E2E_BASE_URL = "http://localhost:5173"
$env:E2E_API_URL = "http://localhost:8000"
& npm.cmd --prefix frontend run test:e2e
exit $LASTEXITCODE

