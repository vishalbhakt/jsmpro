from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import permissions, viewsets

from users.permissions import IsAdminOrTeacherWrite, is_admin, is_student, is_teacher

from .models import Assignment, AssignmentSubmission, Note, Quiz, VideoLecture
from .serializers import (
    AssignmentSerializer,
    AssignmentSubmissionSerializer,
    NoteSerializer,
    QuizSerializer,
    VideoLectureSerializer,
)


class ResourceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrTeacherWrite]
    search_fields = ["title", "description", "subject__name", "classroom__name"]
    ordering_fields = ["created_at", "published_at", "title"]

    def get_queryset(self):
        qs = self.queryset.select_related("classroom", "subject", "teacher", "teacher__user")
        user = self.request.user
        if is_admin(user):
            return qs
        if is_teacher(user) and hasattr(user, "teacher_profile"):
            return qs.filter(
                Q(teacher=user.teacher_profile)
                | Q(subject__teacher=user.teacher_profile)
                | Q(classroom__class_teacher=user.teacher_profile)
            ).distinct()
        if is_student(user) and hasattr(user, "student_profile"):
            return qs.filter(classroom=user.student_profile.classroom, is_published=True)
        return qs.none()

    def perform_create(self, serializer):
        teacher = getattr(self.request.user, "teacher_profile", None)
        published_at = serializer.validated_data.get("published_at")
        serializer.save(
            teacher=teacher or serializer.validated_data.get("teacher"),
            published_at=published_at or timezone.now(),
        )


class NoteViewSet(ResourceViewSet):
    serializer_class = NoteSerializer
    queryset = Note.objects.all()


class VideoLectureViewSet(ResourceViewSet):
    serializer_class = VideoLectureSerializer
    queryset = VideoLecture.objects.all()


class AssignmentViewSet(ResourceViewSet):
    serializer_class = AssignmentSerializer
    queryset = Assignment.objects.annotate(submission_count=Count("submissions"))


class QuizViewSet(ResourceViewSet):
    serializer_class = QuizSerializer
    queryset = Quiz.objects.all()


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ["assignment__title", "student__user__first_name", "student__user__last_name"]
    ordering_fields = ["submitted_at", "grade", "status"]

    def get_queryset(self):
        qs = AssignmentSubmission.objects.select_related(
            "assignment",
            "assignment__classroom",
            "assignment__subject",
            "assignment__teacher",
            "student",
            "student__user",
        )
        user = self.request.user
        if is_admin(user):
            pass
        elif is_teacher(user) and hasattr(user, "teacher_profile"):
            qs = qs.filter(
                Q(assignment__teacher=user.teacher_profile)
                | Q(assignment__subject__teacher=user.teacher_profile)
            ).distinct()
        elif is_student(user):
            qs = qs.filter(student__user=user)
        else:
            qs = qs.none()

        assignment = self.request.query_params.get("assignment")
        if assignment:
            qs = qs.filter(assignment_id=assignment)

        return qs

    def perform_create(self, serializer):
        if is_student(self.request.user) and hasattr(self.request.user, "student_profile"):
            serializer.save(student=self.request.user.student_profile)
            return
        serializer.save()
