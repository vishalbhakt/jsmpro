from django.db.models import Count, Q
from rest_framework import viewsets

from users.permissions import IsAdminOrReadOnly, IsAdminOrTeacherWrite, is_admin, is_student, is_teacher

from .models import Assessment, ClassRoom, Result, Subject
from .serializers import AssessmentSerializer, ClassRoomSerializer, ResultSerializer, SubjectSerializer


class ClassRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ClassRoomSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["name", "section", "academic_year"]
    ordering_fields = ["name", "section", "academic_year", "created_at"]

    def get_queryset(self):
        qs = ClassRoom.objects.select_related("class_teacher", "class_teacher__user").annotate(
            student_count=Count("students")
        )
        user = self.request.user
        if is_admin(user):
            return qs
        if is_teacher(user) and hasattr(user, "teacher_profile"):
            return qs.filter(Q(class_teacher=user.teacher_profile) | Q(subjects__teacher=user.teacher_profile)).distinct()
        if is_student(user) and hasattr(user, "student_profile"):
            return qs.filter(id=user.student_profile.classroom_id)
        return qs.none()


class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["name", "code", "classroom__name"]
    ordering_fields = ["name", "code", "created_at"]

    def get_queryset(self):
        qs = Subject.objects.select_related("classroom", "teacher", "teacher__user")
        user = self.request.user
        if is_admin(user):
            return qs
        if is_teacher(user) and hasattr(user, "teacher_profile"):
            return qs.filter(Q(teacher=user.teacher_profile) | Q(classroom__class_teacher=user.teacher_profile)).distinct()
        if is_student(user) and hasattr(user, "student_profile"):
            return qs.filter(classroom=user.student_profile.classroom)
        return qs.none()


class AssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssessmentSerializer
    permission_classes = [IsAdminOrTeacherWrite]
    search_fields = ["title", "assessment_type", "subject__name", "classroom__name"]
    ordering_fields = ["scheduled_for", "created_at", "title"]

    def get_queryset(self):
        qs = Assessment.objects.select_related("classroom", "subject", "created_by", "created_by__user")
        user = self.request.user
        if is_admin(user):
            return qs
        if is_teacher(user) and hasattr(user, "teacher_profile"):
            return qs.filter(Q(created_by=user.teacher_profile) | Q(subject__teacher=user.teacher_profile)).distinct()
        if is_student(user) and hasattr(user, "student_profile"):
            return qs.filter(classroom=user.student_profile.classroom)
        return qs.none()

    def perform_create(self, serializer):
        teacher = getattr(self.request.user, "teacher_profile", None)
        subject = serializer.validated_data.get("subject")
        classroom = subject.classroom if subject else None
        serializer.save(
            created_by=teacher or serializer.validated_data.get("created_by"),
            classroom=classroom
        )


from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

class ResultViewSet(viewsets.ModelViewSet):
    serializer_class = ResultSerializer
    permission_classes = [IsAdminOrTeacherWrite]
    pagination_class = StandardResultsSetPagination
    search_fields = ["student__user__first_name", "student__user__last_name", "assessment__title"]
    ordering_fields = ["created_at", "marks_obtained", "published_at"]

    def get_queryset(self):
        qs = Result.objects.select_related(
            "assessment",
            "assessment__subject",
            "assessment__classroom",
            "student",
            "student__user",
        )
        user = self.request.user
        if is_admin(user):
            return qs
        if is_teacher(user) and hasattr(user, "teacher_profile"):
            return qs.filter(
                Q(assessment__created_by=user.teacher_profile)
                | Q(assessment__subject__teacher=user.teacher_profile)
            ).distinct()
        if is_student(user):
            qs = qs.filter(student__user=user)
        elif not is_admin(user):
            qs = qs.none()

        # Dynamic query filters
        classroom = self.request.query_params.get("classroom")
        if classroom:
            qs = qs.filter(assessment__classroom_id=classroom)
            
        subject = self.request.query_params.get("subject")
        if subject:
            qs = qs.filter(assessment__subject_id=subject)
            
        assessment = self.request.query_params.get("assessment")
        if assessment:
            qs = qs.filter(assessment_id=assessment)

        return qs
