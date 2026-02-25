from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.permissions import IsAdmin
from .models import BackupRecord
from .serializers import BackupRecordSerializer
from .services import perform_backup, perform_restore


class BackupListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response(BackupRecordSerializer(BackupRecord.objects.all(), many=True).data)

    def post(self, request):
        record = perform_backup(request.user)
        return Response(BackupRecordSerializer(record).data, status=status.HTTP_201_CREATED)


class BackupRestoreView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, backup_id):
        try:
            record = BackupRecord.objects.get(id=backup_id)
        except BackupRecord.DoesNotExist:
            return Response({"detail": "Backup record not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            perform_restore(record)
        except FileNotFoundError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Restore completed successfully"})
