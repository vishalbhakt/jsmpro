from django.conf import settings
from django.db import models


class Announcement(models.Model):
    class Audience(models.TextChoices):
        ALL = "all", "All"
        TEACHERS = "teachers", "Teachers"
        STUDENTS = "students", "Students"
        CLASSROOM = "classroom", "Classroom"

    title = models.CharField(max_length=180)
    body = models.TextField()
    audience = models.CharField(max_length=20, choices=Audience.choices, default=Audience.ALL)
    classroom = models.ForeignKey(
        "academics.ClassRoom",
        on_delete=models.CASCADE,
        related_name="announcements",
        blank=True,
        null=True,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="announcements",
        blank=True,
        null=True,
    )
    pinned = models.BooleanField(default=False)
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-pinned", "-published_at", "-created_at"]

    def __str__(self):
        return self.title


class Notification(models.Model):
    class Category(models.TextChoices):
        SYSTEM = "system", "System"
        ACADEMIC = "academic", "Academic"
        PAYMENT = "payment", "Payment"
        ATTENDANCE = "attendance", "Attendance"

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=160)
    message = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.SYSTEM)
    read_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient} - {self.title}"


class ActivityLog(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="activity_logs",
        blank=True,
        null=True,
    )
    action = models.CharField(max_length=160)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.action
