from django.db import models
from django.conf import settings


class BackupRecord(models.Model):
    file_path = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="backups")

    class Meta:
        ordering = ["-created_at"]
