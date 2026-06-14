from django.contrib import admin

from .models import ActivityLog, Announcement, Notification


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ("title", "audience", "classroom", "pinned", "published_at")
    list_filter = ("audience", "pinned", "published_at")
    search_fields = ("title", "body")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("recipient", "title", "category", "read_at", "created_at")
    list_filter = ("category", "read_at", "created_at")
    search_fields = ("recipient__username", "title", "message")


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("actor", "action", "created_at")
    list_filter = ("created_at",)
    search_fields = ("actor__username", "action")
