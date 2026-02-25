from django.contrib import admin
from .models import BackupRecord


@admin.register(BackupRecord)
class BackupRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "file_path", "created_at", "created_by")
