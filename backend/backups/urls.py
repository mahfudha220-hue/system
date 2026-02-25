from django.urls import path
from .views import BackupListCreateView, BackupRestoreView

urlpatterns = [
    path("", BackupListCreateView.as_view(), name="backup_list_create"),
    path("<int:backup_id>/restore/", BackupRestoreView.as_view(), name="backup_restore"),
]
