#!/usr/bin/env bash
set -e

# Change to project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "==> Checking environment configuration..."

if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Check if APP_KEY is already set
if ! grep -q "^APP_KEY=base64:" .env; then
    echo "Generating fresh Laravel encryption key..."
    RAW_KEY=$(docker compose run --rm backend php artisan key:generate --show)
    KEY=$(echo "$RAW_KEY" | grep "^base64:" | tr -d '\r\n')

    if [ -z "$KEY" ]; then
        echo "Error: Failed to generate Laravel APP_KEY." >&2
        exit 1
    fi

    # Cross-platform sed replacement (macOS and Linux compatible)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^APP_KEY=.*|APP_KEY=$KEY|" .env
    else
        sed -i "s|^APP_KEY=.*|APP_KEY=$KEY|" .env
    fi
    echo "APP_KEY written to .env."
else
    echo "Valid APP_KEY found in .env."
fi

echo "==> Starting containers via Docker Compose..."
docker compose up --build
