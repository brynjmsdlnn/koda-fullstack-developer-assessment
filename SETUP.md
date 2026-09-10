# Setup Guide — Client Project Tracker

Two ways to run the app: **Docker** (recommended) or **locally** without Docker.
Backend API is Laravel (SQLite), frontend is a React + Vite SPA.

| Service  | URL                                                        |
| -------- | ---------------------------------------------------------- |
| Frontend | http://localhost:3000                                      |
| API      | http://localhost:8000/api/projects                         |
| API docs | http://localhost:8000/docs/api (JSON: `/docs/api.json`)    |

## Prerequisites

- Docker Desktop (running) — for the Docker path
- Or, for the local path: PHP ^8.3 + Composer, Node 22 + npm

## Option A — Docker (recommended)

```bash
# 1. From the repo root, make sure the root .env exists (APP_KEY is required).
#    On a fresh clone backend/.env doesn't exist yet (gitignored), so generate
#    the key via the backend image and paste it into .env as APP_KEY=<key>:
#    docker compose run --rm backend php artisan key:generate --show
cp .env.example .env   # then fill in APP_KEY, or reuse the existing .env

# 2. Build and start both services
docker compose up -d --build

# 3. Migrate + seed 12 projects from test_data.json
#    (the entrypoint already runs migrations; this adds the seed data)
docker compose exec backend php artisan migrate --seed
```

Open http://localhost:3000.

Notes:

- The backend container serves on `:8000`; the frontend container runs Vite on `:3000` and proxies `/api/*` to `http://backend:8000` (see `compose.yaml`).
- Source dirs are bind-mounted, so code edits apply live. But `node_modules` (frontend) and `vendor` (backend) live in anonymous volumes: after changing `package.json` / `composer.json`, rebuild with `docker compose up -d --build`, and if stale deps persist, recreate volumes with `docker compose down -v && docker compose up -d --build` (SQLite data lives in `./backend/`, so it survives).
- Run backend commands via `docker compose exec backend php artisan <cmd>` (e.g. `test --compact`).

## Option B — Local (no Docker)

Terminal 1 — backend:

```bash
cd backend
composer install
cp .env.example .env   # if needed
php artisan key:generate
# create the SQLite file if missing:
#   bash: touch database/database.sqlite
#   PowerShell: New-Item database/database.sqlite -ItemType File
php artisan migrate --seed       # seeds 12 projects from test_data.json
php artisan serve --host=127.0.0.1 --port=8000
# (or `composer run dev` for serve + queue + logs concurrently)
```

Terminal 2 — frontend:

```bash
cd frontend
npm install
```

PowerShell:

```powershell
$env:BACKEND_URL='http://localhost:8000'
npm run dev
```

CMD / bash:

```bash
BACKEND_URL=http://localhost:8000 npm run dev
```

Open http://localhost:3000.

> Gotcha: `frontend/vite.config.ts` proxies `/api` to `process.env.BACKEND_URL || 'http://backend:8000'`.
> The `backend` hostname only resolves inside Docker. Running Vite locally without
> `BACKEND_URL=http://localhost:8000` produces `502 Bad Gateway` on every `/api/*` call.

## Useful commands

```bash
# Backend tests (from backend/, or via `docker compose exec backend ...`)
php artisan test --compact
vendor/bin/pint --dirty          # format changed PHP files

# Frontend (from frontend/)
npm run generate-api             # regenerate TS client from http://localhost:8000/docs/api.json (backend must be running)
npm run build                    # production build
npm run lint                     # eslint
npm run check                    # prettier check
```

## Troubleshooting

| Symptom | Cause / fix |
| ------- | ----------- |
| `502 Bad Gateway` on `/api/*` with local `npm run dev` | `BACKEND_URL` not set — see Option B gotcha above |
| Old UI after pulling changes (Docker) | Stale image/volume: `docker compose up -d --build`, or `down -v` + rebuild |
| `SQLSTATE … database.sqlite … unable to open` | Create the file (`touch backend/database/database.sqlite`) and `php artisan migrate --force` |
| Port already in use (`:3000` / `:8000`) | Stop the other server or the Docker service using it |
| `GET /` returns JSON, not a page | Intended — the backend is API-only; the UI lives at `:3000` |
