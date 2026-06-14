from django.contrib import admin

from .models import Assessment, ClassRoom, Result, Subject


@admin.register(ClassRoom)
class ClassRoomAdmin(admin.ModelAdmin):
    list_display = ("name", "section", "academic_year", "class_teacher", "is_active")
    list_filter = ("academic_year", "is_active")
    search_fields = ("name", "section")


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "classroom", "teacher", "is_active")
    list_filter = ("classroom", "is_active")
    search_fields = ("name", "code", "teacher__user__first_name", "teacher__user__last_name")


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ("title", "assessment_type", "classroom", "subject", "max_marks", "scheduled_for")
    list_filter = ("assessment_type", "classroom", "subject")
    search_fields = ("title",)


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ("student", "assessment", "marks_obtained", "grade", "published_at")
    list_filter = ("assessment__subject", "grade")
    search_fields = ("student__user__first_name", "student__user__last_name", "assessment__title")
