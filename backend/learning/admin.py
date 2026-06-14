from django.contrib import admin

from .models import Assignment, AssignmentSubmission, Note, Quiz, VideoLecture


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("title", "classroom", "subject", "teacher", "is_published", "published_at")
    list_filter = ("classroom", "subject", "is_published")
    search_fields = ("title", "description")


@admin.register(VideoLecture)
class VideoLectureAdmin(admin.ModelAdmin):
    list_display = ("title", "classroom", "subject", "teacher", "duration_minutes", "is_published")
    list_filter = ("classroom", "subject", "is_published")
    search_fields = ("title", "description")


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ("title", "classroom", "subject", "teacher", "due_at", "status")
    list_filter = ("classroom", "subject", "status")
    search_fields = ("title", "description")


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ("assignment", "student", "status", "grade", "submitted_at")
    list_filter = ("status", "assignment__classroom")
    search_fields = ("assignment__title", "student__user__first_name", "student__user__last_name")


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("title", "classroom", "subject", "teacher", "starts_at", "ends_at", "is_published")
    list_filter = ("classroom", "subject", "is_published")
    search_fields = ("title", "description")
