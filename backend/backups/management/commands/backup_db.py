from django.core.management.base import BaseCommand
from backups.services import perform_backup


class Command(BaseCommand):
    help = "Create a backup copy of the database"

    def handle(self, *args, **options):
        record = perform_backup()
        self.stdout.write(self.style.SUCCESS(f"Backup created: {record.file_path}"))
