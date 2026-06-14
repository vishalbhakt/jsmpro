from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import StudentProfile, TeacherProfile, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "first_name", "last_name", "role", "is_active")
    list_filter = ("role", "is_active", "is_staff", "is_verified")
    search_fields = ("username", "email", "first_name", "last_name", "phone")
    fieldsets = UserAdmin.fieldsets + (
        ("JSM Profile", {"fields": ("role", "phone", "address", "avatar", "is_verified")}),
    )


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ("employee_id", "user", "designation", "status", "joined_on")
    search_fields = ("employee_id", "user__first_name", "user__last_name", "user__email")
    list_filter = ("status", "designation")


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("admission_number", "user", "classroom", "roll_number", "status")
    search_fields = ("admission_number", "roll_number", "user__first_name", "user__last_name")
    list_filter = ("status", "classroom")
