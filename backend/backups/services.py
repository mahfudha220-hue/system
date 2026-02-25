from pathlib import Path
from django.core.management import call_command
from django.conf import settings
from django.utils import timezone
from .models import BackupRecord


def perform_backup(user=None):
    backup_dir = Path(settings.BACKUP_DIR)
    backup_dir.mkdir(parents=True, exist_ok=True)
    timestamp = timezone.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"db_backup_{timestamp}.json"
    with backup_file.open("w", encoding="utf-8") as fh:
        call_command("dumpdata", "--natural-foreign", "--natural-primary", stdout=fh)
    return BackupRecord.objects.create(file_path=str(backup_file), created_by=user)


def perform_restore(backup_record: BackupRecord):
    source_path = Path(backup_record.file_path)
    if not source_path.exists():
        raise FileNotFoundError("Backup file does not exist")
    call_command("flush", "--no-input")
    call_command("loaddata", str(source_path))
