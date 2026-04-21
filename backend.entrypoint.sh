#!/usr/bin/env bash
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"

echo "Waiting for Postgres at ${DB_HOST}:${DB_PORT}..."
until pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" >/dev/null 2>&1; do
  sleep 1
done
echo "Postgres is ready."

python manage.py makemigrations --noinput
python manage.py migrate --noinput
python manage.py collectstatic --noinput --clear

# Auto-create a Django superuser on first boot if ADMIN_EMAIL + ADMIN_PASSWORD
# are set. ADMIN_USERNAME defaults to "admin" if unset. Safe to re-run — skips
# when the user already exists.
if [ -n "${ADMIN_EMAIL}" ] && [ -n "${ADMIN_PASSWORD}" ]; then
  python manage.py shell <<'PY'
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.environ.get("ADMIN_USERNAME") or "admin"
email = os.environ["ADMIN_EMAIL"]
password = os.environ["ADMIN_PASSWORD"]

if User.objects.filter(username=username).exists():
    print(f"[entrypoint] Superuser '{username}' already exists, skipping.")
else:
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"[entrypoint] Superuser '{username}' <{email}> created.")
PY
fi

exec "$@"
