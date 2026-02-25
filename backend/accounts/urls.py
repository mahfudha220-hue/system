from django.urls import path
from .views import CurrentUserView, UserManagementView

urlpatterns = [
    path("me/", CurrentUserView.as_view(), name="current_user"),
    path("users/", UserManagementView.as_view(), name="user_management"),
]
