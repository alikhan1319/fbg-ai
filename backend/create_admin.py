"""
Create an admin user in MySQL.

Usage (from backend folder):
  python create_admin.py --email you@example.com --password "YourPassword" --name "Your Name"
"""

from __future__ import annotations

import argparse
import sys

import bootstrap

bootstrap.ensure_venv_python()

from cms_auth import hash_password
from cms_database import get_db
from cms_models import AdminUser


def main() -> int:
    parser = argparse.ArgumentParser(description="Create an admin user in the CMS database.")
    parser.add_argument("--email", required=True, help="Admin email (login username)")
    parser.add_argument("--password", required=True, help="Password (min 6 characters)")
    parser.add_argument("--name", default="Admin", help="Display name")
    parser.add_argument("--role", default="admin", choices=["admin", "editor"])
    args = parser.parse_args()

    email = args.email.strip().lower()
    if len(args.password) < 6:
        print("Error: password must be at least 6 characters.", file=sys.stderr)
        return 1

    with get_db() as db:
        existing = db.query(AdminUser).filter(AdminUser.email == email).first()
        if existing:
            print(f"Admin already exists: {email} (id={existing.id})")
            return 0

        user = AdminUser(
            email=email,
            password_hash=hash_password(args.password),
            name=args.name.strip() or "Admin",
            role=args.role,
            is_active=True,
        )
        db.add(user)
        db.flush()
        print(f"Created admin user id={user.id} email={email} role={args.role}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
