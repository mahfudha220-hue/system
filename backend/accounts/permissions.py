from rest_framework import permissions
from accounts.models import UserRole


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.ADMIN)


class IsManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [UserRole.ADMIN, UserRole.MANAGER])


class IsCashierOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [UserRole.ADMIN, UserRole.CASHIER])
