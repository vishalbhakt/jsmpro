from django.contrib import admin

from .models import AttendanceRecord, AttendanceSession


class AttendanceRecordInline(admin.TabularInline):
    model = AttendanceRecord
    extra = 0


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ("classroom", "subject", "date", "taken_by")
    list_filter = ("date", "classroom", "subject")
    search_fields = ("classroom__name", "subject__name")
    inlines = [AttendanceRecordInline]


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("student", "session", "status", "updated_at")
    list_filter = ("status", "session__date", "session__classroom")
    search_fields = ("student__user__first_name", "student__user__last_name")
