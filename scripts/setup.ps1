$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
Set-Location $rootDir

Write-Host "==> Checking environment configuration..." -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

$envContent = Get-Content ".env" -Raw
$hasValidKey = $envContent -match "APP_KEY=base64:[A-Za-z0-9+/=]{44}"

if (-not $hasValidKey) {
    Write-Host "Generating fresh Laravel encryption key..." -ForegroundColor Yellow
    $output = docker compose run --rm backend php artisan key:generate --show
    $key = ($output | Where-Object { $_ -match '^base64:' } | Select-Object -First 1).Trim()

    if (-not $key) {
        Write-Error "Failed to generate Laravel APP_KEY."
        exit 1
    }

    $lines = Get-Content ".env"
    $updated = $lines | ForEach-Object {
        if ($_ -match "^APP_KEY=") {
            "APP_KEY=$key"
        } else {
            $_
        }
    }
    Set-Content ".env" $updated
    Write-Host "APP_KEY written to .env." -ForegroundColor Green
} else {
    Write-Host "Valid APP_KEY found in .env." -ForegroundColor Green
}

Write-Host "==> Starting containers via Docker Compose..." -ForegroundColor Cyan
docker compose up --build
