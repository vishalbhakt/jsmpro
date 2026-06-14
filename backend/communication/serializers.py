from rest_framework import serializers

from .models import ActivityLog, Announcement, Notification


class AnnouncementSerializer(serializers.ModelSerializer):
    classroom_name = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)

    class Meta:
        model = Announcement
        fields = [
            "id",
            "title",
            "body",
            "audience",
            "classroom",
            "classroom_name",
            "created_by",
            "created_by_name",
            "pinned",
            "published_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_classroom_name(self, obj):
        return str(obj.classroom) if obj.classroom else None


class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source="recipient.full_name", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "recipient_name",
            "title",
            "message",
            "category",
            "read_at",
            "created_at",
        ]
        read_only_fields = ["created_at"]


class ActivityLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.full_name", read_only=True)

    class Meta:
        model = ActivityLog
        fields = ["id", "actor", "actor_name", "action", "metadata", "created_at"]
        read_only_fields = ["created_at"]
