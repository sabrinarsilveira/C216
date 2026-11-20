$ErrorActionPreference = "Stop"
$project = "lab-e2e"
$compose = @("-p", $project, "-f", "docker-compose.e2e.yml")
try {
    & docker compose @compose up -d --build --wait
    if ($LASTEXITCODE -ne 0) { throw "Falha ao iniciar a stack E2E" }
    $env:E2E_BASE_URL = "http://localhost:5174"
    $env:E2E_API_URL = "http://localhost:8001"
    & npm.cmd --prefix frontend run test:e2e
    if ($LASTEXITCODE -ne 0) { throw "Playwright falhou" }
}
finally {
    & docker compose @compose down -v
}

