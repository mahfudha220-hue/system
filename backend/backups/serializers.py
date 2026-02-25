from rest_framework import serializers
from .models import BackupRecord


class BackupRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackupRecord
        fields = ["id", "file_path", "created_at", "created_by"]
        read_only_fields = fields
