from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import LoginView, CashierRegisterView, ChangePasswordView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login/", LoginView.as_view(), name="login"),
    path("api/auth/register-cashier/", CashierRegisterView.as_view(), name="register_cashier"),
    path("api/auth/change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/accounts/", include("accounts.urls")),
    path("api/billing/", include("billing.urls")),
    path("api/backups/", include("backups.urls")),
]
