# BDMS — VitalStream

Blood Donation Management System.
A Django REST backend + React Native (Expo) mobile app implementing the functionality described in `charter.docx`.

## Repo layout

```
BDMS/
├── backend/      Django + DRF API (accounts, donors, hospitals, inventory, requests, donations)
└── mobile/       React Native (Expo + TypeScript) app for donors and hospital admins
```

## Core features

- **Role-based auth** (JWT): donor, hospital_admin, system_admin
- **Donor registration** with blood group, phone, city
- **Hospital registration** (creates a hospital linked to the admin user)
- **Lab report upload + verification** — donor uploads PDF/image, hospital admin approves ⇒ donor becomes `is_verified`
- **90-day cooldown**: recording a donation sets `last_donation_date`; `is_eligible` flips false until 90 days pass
- **Blood requests**: hospitals post requests; donors see requests matching their blood group and city; donors can offer to help
- **Inventory management**: each hospital maintains units per blood group; donation auto-increments inventory
- **Donor search**: hospitals filter verified donors by blood group and city

## Backend — setup

From `backend/`:

```bash
# 1. Install pip inside the existing venv (Debian/Ubuntu/WSL only needs this once)
sudo apt install python3-pip python3-venv python3-dev libpq-dev
python3 -m venv .venv --upgrade-deps     # or: rm -rf .venv && python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure env
cp .env.example .env
# Edit .env. For quick local dev set DB_ENGINE=sqlite.
# For Postgres (as charter specifies): create the db then keep DB_ENGINE=postgres.
#     createdb vitalstream

# 4. Create DB schema + admin user
python manage.py makemigrations accounts donors hospitals inventory requests_app donations
python manage.py migrate
python manage.py createsuperuser

# 5. Run
python manage.py runserver 0.0.0.0:8000
```

Admin panel: http://127.0.0.1:8000/admin/

### API summary

| Method | Path                                  | Role            | Purpose                            |
|--------|---------------------------------------|-----------------|------------------------------------|
| POST   | /api/auth/register/                   | anonymous       | Register donor or hospital admin   |
| POST   | /api/auth/login/                      | anonymous       | JWT access + refresh               |
| POST   | /api/auth/refresh/                    | anonymous       | Refresh access token               |
| GET    | /api/auth/me/                         | authenticated   | Current user                       |
| GET    | /api/donors/me/                       | donor           | My donor profile                   |
| PATCH  | /api/donors/me/                       | donor           | Update blood group, weight, etc.   |
| GET    | /api/donors/me/eligibility/           | donor           | Cooldown status                    |
| POST   | /api/donors/reports/upload/           | donor           | Upload lab report (multipart)      |
| GET    | /api/donors/me/reports/               | donor           | My uploaded reports                |
| GET    | /api/donors/reports/pending/          | hospital_admin  | Reports awaiting review            |
| POST   | /api/donors/reports/{id}/review/      | hospital_admin  | Approve (verifies donor) or reject |
| GET    | /api/donors/search/                   | hospital_admin  | Search verified donors             |
| GET    | /api/hospitals/                       | authenticated   | List hospitals                     |
| GET/PATCH | /api/hospitals/me/                 | hospital_admin  | My hospital profile                |
| GET/POST | /api/inventory/me/                  | hospital_admin  | Own inventory                      |
| PATCH/DEL | /api/inventory/me/{id}/            | hospital_admin  | Update/delete inventory row        |
| GET    | /api/inventory/                       | authenticated   | Browse inventory across hospitals  |
| GET    | /api/requests/                        | authenticated   | List requests (`?matching=1`)      |
| POST   | /api/requests/                        | hospital_admin  | Create a blood request             |
| PATCH  | /api/requests/{id}/status/            | hospital_admin  | Mark fulfilled / cancelled         |
| POST   | /api/requests/{id}/respond/           | donor           | Offer to help with a request       |
| GET    | /api/requests/{id}/responses/         | hospital_admin  | See donors who offered             |
| GET    | /api/requests/my-responses/           | donor           | My offers                          |
| POST   | /api/donations/record/                | hospital_admin  | Record a donation (cooldown + inv) |
| GET    | /api/donations/mine/                  | donor           | Donation history                   |
| GET    | /api/donations/hospital/              | hospital_admin  | Hospital's donation log            |

## Mobile — setup

From `mobile/`:

```bash
npm install
# Emulator (Android): API URL defaults to http://10.0.2.2:8000/api  (bridged to host localhost)
# Physical device: edit mobile/app.json → expo.extra.apiBaseUrl to your machine's LAN IP, e.g.
#   "apiBaseUrl": "http://192.168.1.20:8000/api"
npx expo start
```

Press `a` for Android, `i` for iOS simulator, or scan the QR with Expo Go on device.

## Testing flow end-to-end

1. Start backend on `0.0.0.0:8000`.
2. In the mobile app, register a **hospital admin** → fill hospital name/city.
3. Sign out, register a **donor** → pick blood group.
4. Donor → Profile → **Upload Lab Report** (any PDF/image).
5. Sign out, sign in as the hospital admin → Home → **Review lab reports** → Approve.
6. Donor is now verified and visible in **Find Donors**.
7. Hospital admin → Requests → **New request** → donor sees it in the matching list.
8. Donor **offers to help**; hospital admin sees the contact info.
9. Hospital admin → **Record donation** → donor goes into 90-day cooldown; inventory increases.

## Notes on the charter

- Charter originally specified Django Templates for the frontend. This build swaps that for a JSON REST API (DRF) consumed by a React Native mobile app — all the "Smart Cooldown", "Manual Verification" and "Blood Inventory" logic listed in the charter still lives server-side.
- Cooldown length (`COOLDOWN_DAYS = 90`) is set in `backend/donors/models.py`.
- The lab-report upload matches Week 15's **Lab Report Verification** module.
- The inventory endpoints match Week 13's **blood inventory logic**.
