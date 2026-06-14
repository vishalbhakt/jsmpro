from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets

from users.permissions import IsAdmin, IsAdminOrReadOnly, IsAdminOrTeacherWrite, is_admin, is_student, is_teacher

from .models import ActivityLog, Announcement, Notification
from .serializers import ActivityLogSerializer, AnnouncementSerializer, NotificationSerializer


class AnnouncementViewSet(viewsets.ModelViewSet):
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAdminOrTeacherWrite]
    search_fields = ["title", "body", "audience"]
    ordering_fields = ["published_at", "created_at", "pinned"]

    def get_queryset(self):
        qs = Announcement.objects.select_related("classroom", "created_by")
        user = self.request.user
        if is_admin(user) or is_teacher(user):
            return qs
        if is_student(user) and hasattr(user, "student_profile"):
            return qs.filter(
                Q(audience=Announcement.Audience.ALL)
                | Q(audience=Announcement.Audience.STUDENTS)
                | Q(audience=Announcement.Audience.CLASSROOM, classroom=user.student_profile.classroom)
            )
        return qs.none()

    def perform_create(self, serializer):
        published_at = serializer.validated_data.get("published_at")
        serializer.save(created_by=self.request.user, published_at=published_at or timezone.now())


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["title", "message", "category"]
    ordering_fields = ["created_at", "read_at", "category"]

    def get_queryset(self):
        qs = Notification.objects.select_related("recipient")
        if is_admin(self.request.user):
            return qs
        return qs.filter(recipient=self.request.user)


class ActivityLogViewSet(viewsets.ModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdmin]
    queryset = ActivityLog.objects.select_related("actor")
    search_fields = ["action"]
    ordering_fields = ["created_at"]
