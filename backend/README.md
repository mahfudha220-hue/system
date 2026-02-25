# Billing Backend (Django)

## Features
- Invoice generation and status tracking (paid/unpaid)
- Payment recording (cash, bank transfer, mobile money, card)
- JWT login with role-based access (admin/cashier/manager)
- Reports API for managers/admins
- Manual backup + restore APIs for admins
- Automatic backup on invoice/payment creation

## Setup
1. python -m venv .venv
2. .venv\Scripts\activate
3. pip install -r requirements.txt
4. python manage.py makemigrations
5. python manage.py migrate
6. python manage.py createsuperuser
7. python manage.py runserver

## PostgreSQL setup
The project is configured to use PostgreSQL when `USE_POSTGRES=1`.

Example (PowerShell):
```powershell
$env:USE_POSTGRES="1"
$env:POSTGRES_DB="payment_system"
$env:POSTGRES_USER="postgres"
$env:POSTGRES_PASSWORD="<your-postgres-password>"
$env:POSTGRES_HOST="127.0.0.1"
$env:POSTGRES_PORT="5432"
python manage.py migrate
python manage.py runserver
```

## Automatic backup scheduler
Use Windows Task Scheduler to run this command periodically:
`python manage.py backup_db`
