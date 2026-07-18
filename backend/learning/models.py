from django.db import models
from django.utils import timezone


class LearningResource(models.Model):
    classroom = models.ForeignKey("academics.ClassRoom", on_delete=models.CASCADE, related_name="%(class)s_resources")
    subject = models.ForeignKey("academics.Subject", on_delete=models.CASCADE, related_name="%(class)s_resources")
    teacher = models.ForeignKey(
        "users.TeacherProfile",
        on_delete=models.SET_NULL,
        related_name="%(class)s_resources",
        blank=True,
        null=True,
    )
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    is_published = models.BooleanField(default=True)
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.classroom_id and self.subject_id:
            self.classroom = self.subject.classroom
        if not self.published_at and self.is_published:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)


class Note(LearningResource):
    file = models.FileField(upload_to="notes/")


class VideoLecture(LearningResource):
    video_url = models.URLField(blank=True)
    video_file = models.FileField(upload_to="videos/", blank=True, null=True)
    thumbnail = models.ImageField(upload_to="video-thumbnails/", blank=True, null=True)
    duration_minutes = models.PositiveIntegerField(default=0)

    @property
    def embed_video_url(self):
        url = self.video_url
        if not url:
            return ""
        
        from urllib.parse import urlparse, parse_qs
        parsed_url = urlparse(url)
        
        # Check if it's youtube.com
        if "youtube.com" in parsed_url.netloc:
            # check for watch?v=
            if parsed_url.path == "/watch":
                queries = parse_qs(parsed_url.query)
                video_id = queries.get("v", [None])[0]
                if video_id:
                    return f"https://www.youtube.com/embed/{video_id}"
            # check for embed/
            elif parsed_url.path.startswith("/embed/"):
                return url
            # check for v/
            elif parsed_url.path.startswith("/v/"):
                video_id_parts = parsed_url.path.split("/")
                if len(video_id_parts) > 2:
                    return f"https://www.youtube.com/embed/{video_id_parts[2]}"
        # Check if it's youtu.be
        elif "youtu.be" in parsed_url.netloc:
            video_id = parsed_url.path.strip("/")
            if video_id:
                return f"https://www.youtube.com/embed/{video_id}"
                
        return url



class Assignment(LearningResource):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        CLOSED = "closed", "Closed"

    due_at = models.DateTimeField()
    attachment = models.FileField(upload_to="assignments/", blank=True, null=True)
    points = models.PositiveIntegerField(default=100)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PUBLISHED)

    def clean(self):
        super().clean()
        import re
        from django.core.exceptions import ValidationError
        if self.title and re.search(r'https?://|www\.', self.title, re.IGNORECASE):
            raise ValidationError({"title": "Title cannot contain raw URLs."})


class AssignmentSubmission(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        GRADED = "graded", "Graded"
        RETURNED = "returned", "Returned"

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey("users.StudentProfile", on_delete=models.CASCADE, related_name="submissions")
    text_answer = models.TextField(blank=True)
    file = models.FileField(upload_to="assignment-submissions/", blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    feedback = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["assignment", "student"],
                name="unique_submission_per_assignment_student",
            )
        ]
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.student} - {self.assignment}"


class Quiz(LearningResource):
    instructions = models.TextField(blank=True)
    total_questions = models.PositiveIntegerField(default=0)
    max_marks = models.PositiveIntegerField(default=0)
    starts_at = models.DateTimeField(blank=True, null=True)
    ends_at = models.DateTimeField(blank=True, null=True)


class NoteAccessLog(models.Model):
    student = models.ForeignKey("users.StudentProfile", on_delete=models.CASCADE, related_name="note_access_logs")
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name="access_logs")
    accessed_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "note"],
                name="unique_access_per_student_note",
            )
        ]

    def __str__(self):
        return f"{self.student} accessed {self.note} at {self.accessed_at}"


class VideoWatchLog(models.Model):
    student = models.ForeignKey("users.StudentProfile", on_delete=models.CASCADE, related_name="video_watch_logs")
    video = models.ForeignKey(VideoLecture, on_delete=models.CASCADE, related_name="watch_logs")
    watched_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "video"],
                name="unique_watch_per_student_video",
            )
        ]

    def __str__(self):
        return f"{self.student} watched {self.video} at {self.watched_at}"

