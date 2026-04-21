# BDMS — VitalStream

Blood Donation Management System.
Django REST backend + PostgreSQL + React Native (Expo) mobile client

## Repo layout

```
BDMS/
├── Dockerfile.backend       # Django + DRF image
├── Dockerfile.mobile        # Expo web image (Node 20)
├── docker-compose.yml       # db + backend + mobile services
├── backend.entrypoint.sh    # waits for Postgres, runs migrations, starts server
├── .dockerignore
├── .gitignore
├── backend/                 # Django project
│   ├── accounts/            # User + role + JWT auth
│   ├── donors/              # DonorProfile, LabReport, cooldown
│   ├── hospitals/           # Hospital profile
│   ├── inventory/           # Blood inventory per hospital
│   ├── requests_app/        # BloodRequest + RequestResponse
│   ├── donations/           # Donation records (triggers cooldown + inventory ++)
│   └── vitalstream/         # settings, urls, wsgi, asgi
└── mobile/                  # Expo + TypeScript app
    └── src/
        ├── api/             # axios client + endpoint wrappers
        ├── context/         # AuthContext
        ├── navigation/      # Root/Auth/Donor/Hospital navigators
        ├── screens/         # auth/, donor/, hospital/, shared/
        └── components/      # Button, TextField, Chip
```

## Core features

- **Role-based auth** (JWT): `donor`, `hospital_admin`, `system_admin`
- **Donor registration** with blood group, phone, city
- **Hospital registration** (auto-creates a Hospital linked to the admin user)
- **Lab report upload + verification** — donor uploads PDF/image, hospital admin approves → donor becomes `is_verified`
- **90-day cooldown** — recording a donation sets `last_donation_date`; `is_eligible` is `false` for 90 days
- **Blood requests** — hospitals post requests; donors see requests matching their blood group and city; donors can offer to help
- **Inventory** — each hospital maintains units per blood group; a recorded donation auto-increments the right row
- **Donor search** — hospital admins filter verified donors by blood group and city

## Quick start (Docker — recommended)

Prereqs: Docker Desktop (or Docker Engine + Compose plugin) and ~2GB free disk.

```bash
cd /mnt/d/BDMS

# 1. (Optional) copy the env template and edit admin creds
cp .env.example .env

# 2. Build and launch Postgres + Django + Expo web
docker compose up --build
```

On first boot the backend entrypoint waits for Postgres, runs migrations, collects static
files, and auto-creates a Django superuser from `ADMIN_EMAIL` + `ADMIN_PASSWORD` (with
`ADMIN_USERNAME` defaulting to `admin`). You can log in to `/admin/` immediately with
whatever you set in `.env` (or the defaults `admin` / `admin`).

Then:

| Service        | URL                             |
|----------------|---------------------------------|
| Django API     | http://localhost:8000/api/      |
| Django admin   | http://localhost:8000/admin/    |
| Expo web app   | http://localhost:19006/         |
| Metro bundler  | http://localhost:8081/          |
| Postgres       | localhost:5432 (user `postgres`, db `vitalstream`) |

### Overriding defaults

Every secret/URL has a sensible default; override by creating a `.env` at the repo root. Example:

```
SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=*
DB_NAME=vitalstream
DB_USER=postgres
DB_PASSWORD=supersecret
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

`docker compose` auto-reads `.env` in the same directory.

### Common commands

```bash
docker compose up                      # start
docker compose up --build              # rebuild images then start
docker compose down                    # stop (keeps data)
docker compose down -v                 # stop and wipe pgdata / media volumes
docker compose logs -f backend         # tail backend logs
docker compose exec backend bash       # shell into the backend container
docker compose exec db psql -U postgres vitalstream   # psql shell
docker compose exec backend python manage.py shell    # Django shell
```

On first boot `backend.entrypoint.sh` waits for Postgres, runs
`makemigrations → migrate → collectstatic`, then starts Django. So your database
schema is always in sync with the models.

### Phone testing with Expo Go

The Expo web container serves at `localhost:19006`, but **native testing** (Expo Go
app on a real phone, or Android/iOS emulator) is easier to run on the host because
Expo Go needs to reach Metro on your LAN:

```bash
cd mobile
npm install
EXPO_PUBLIC_API_URL=http://<your-LAN-ip>:8000/api npx expo start
```

The backend is still in Docker (`localhost:8000` on the host, or `<LAN-ip>:8000`
from the phone). Set `ALLOWED_HOSTS=*` in `.env` during dev.

## Non-Docker fallback

If you'd rather run without Docker, you need a local Postgres.

```bash
# Install a Postgres 14+ and create the db
createdb vitalstream

# Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit DB_HOST/DB_USER/DB_PASSWORD to match your local PG
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000

# Mobile (separate terminal)
cd mobile
npm install
npx expo start
```

## API summary

| Method   | Path                                  | Role            | Purpose                            |
|----------|---------------------------------------|-----------------|------------------------------------|
| POST     | /api/auth/register/                   | anonymous       | Register donor or hospital admin   |
| POST     | /api/auth/login/                      | anonymous       | JWT access + refresh               |
| POST     | /api/auth/refresh/                    | anonymous       | Refresh access token               |
| GET      | /api/auth/me/                         | authenticated   | Current user                       |
| GET      | /api/donors/me/                       | donor           | My donor profile                   |
| PATCH    | /api/donors/me/                       | donor           | Update blood group, weight, etc.   |
| GET      | /api/donors/me/eligibility/           | donor           | Cooldown status                    |
| POST     | /api/donors/reports/upload/           | donor           | Upload lab report (multipart)      |
| GET      | /api/donors/me/reports/               | donor           | My uploaded reports                |
| GET      | /api/donors/reports/pending/          | hospital_admin  | Reports awaiting review            |
| POST     | /api/donors/reports/{id}/review/      | hospital_admin  | Approve (verifies donor) or reject |
| GET      | /api/donors/search/                   | hospital_admin  | Search verified donors             |
| GET      | /api/hospitals/                       | authenticated   | List hospitals                     |
| GET/PATCH| /api/hospitals/me/                    | hospital_admin  | My hospital profile                |
| GET/POST | /api/inventory/me/                    | hospital_admin  | Own inventory                      |
| PATCH/DEL| /api/inventory/me/{id}/               | hospital_admin  | Update / delete inventory row      |
| GET      | /api/inventory/                       | authenticated   | Browse inventory across hospitals  |
| GET      | /api/requests/                        | authenticated   | List requests (`?matching=1`)      |
| POST     | /api/requests/                        | hospital_admin  | Create a blood request             |
| PATCH    | /api/requests/{id}/status/            | hospital_admin  | Mark fulfilled / cancelled         |
| POST     | /api/requests/{id}/respond/           | donor           | Offer to help with a request       |
| GET      | /api/requests/{id}/responses/         | hospital_admin  | See donors who offered             |
| GET      | /api/requests/my-responses/           | donor           | My offers                          |
| POST     | /api/donations/record/                | hospital_admin  | Record a donation (cooldown + inv) |
| GET      | /api/donations/mine/                  | donor           | Donation history                   |
| GET      | /api/donations/hospital/              | hospital_admin  | Hospital's donation log            |

## End-to-end smoke test

1. `docker compose up --build`
2. Open http://localhost:19006/ → **Register** as a hospital admin (e.g. "AKUH Karachi").
3. Sign out, register a **Donor** (pick blood group).
4. Donor → Profile → **Upload Lab Report** (any PDF/image).
5. Sign out, sign in as the hospital admin → Home → **Review lab reports** → Approve.
6. Donor is now `is_verified` and visible in **Find Donors**.
7. Hospital admin → Requests → **New request** → donor sees it under **Matching requests**.
8. Donor **offers to help**; hospital admin sees the donor's contact info.
9. Hospital admin → **Record donation** → donor enters 90-day cooldown; inventory auto-increments.

