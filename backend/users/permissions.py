from rest_framework import permissions

from .models import User


def is_admin(user):
    return bool(user and user.is_authenticated and user.role == User.Roles.ADMIN)


def is_teacher(user):
    return bool(user and user.is_authenticated and user.role == User.Roles.TEACHER)


def is_student(user):
    return bool(user and user.is_authenticated and user.role == User.Roles.STUDENT)


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return is_admin(request.user)


class IsAdminOrTeacherWrite(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return is_admin(request.user) or is_teacher(request.user)


class IsSelfOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if is_admin(request.user):
            return True
        obj_user = getattr(obj, "user", obj)
        return obj_user == request.user
