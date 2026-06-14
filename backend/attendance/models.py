from django.db import models


class AttendanceSession(models.Model):
    classroom = models.ForeignKey(
        "academics.ClassRoom",
        on_delete=models.CASCADE,
        related_name="attendance_sessions",
    )
    subject = models.ForeignKey(
        "academics.Subject",
        on_delete=models.SET_NULL,
        related_name="attendance_sessions",
        blank=True,
        null=True,
    )
    date = models.DateField()
    taken_by = models.ForeignKey(
        "users.TeacherProfile",
        on_delete=models.SET_NULL,
        related_name="attendance_sessions",
        blank=True,
        null=True,
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["classroom", "subject", "date"],
                name="unique_attendance_session",
            )
        ]
        ordering = ["-date", "classroom__name"]

    def __str__(self):
        return f"{self.classroom} - {self.date}"


class AttendanceRecord(models.Model):
    class Status(models.TextChoices):
        PRESENT = "present", "Present"
        ABSENT = "absent", "Absent"
        LATE = "late", "Late"
        EXCUSED = "excused", "Excused"

    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name="records")
    student = models.ForeignKey("users.StudentProfile", on_delete=models.CASCADE, related_name="attendance_records")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)
    remarks = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["session", "student"],
                name="unique_attendance_record_per_student",
            )
        ]
        ordering = ["session__date", "student__roll_number"]

    def __str__(self):
        return f"{self.student} - {self.status}"
