from django.db.models import Q
from rest_framework import viewsets

from users.permissions import IsAdminOrReadOnly, is_admin, is_student, is_teacher

from .models import FeePlan, Payment
from .serializers import FeePlanSerializer, PaymentSerializer


class FeePlanViewSet(viewsets.ModelViewSet):
    serializer_class = FeePlanSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["title", "classroom__name"]
    ordering_fields = ["due_date", "amount", "created_at"]

    def get_queryset(self):
        qs = FeePlan.objects.select_related("classroom")
        user = self.request.user
        if is_admin(user):
            return qs
        if is_teacher(user) and hasattr(user, "teacher_profile"):
            return qs.filter(
                Q(classroom__class_teacher=user.teacher_profile)
                | Q(classroom__subjects__teacher=user.teacher_profile)
            ).distinct()
        if is_student(user) and hasattr(user, "student_profile"):
            return qs.filter(classroom=user.student_profile.classroom, is_active=True)
        return qs.none()


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["student__user__first_name", "student__user__last_name", "transaction_id", "status"]
    ordering_fields = ["created_at", "paid_at", "amount", "status"]

    def get_queryset(self):
        qs = Payment.objects.select_related("student", "student__user", "fee_plan", "fee_plan__classroom")
        user = self.request.user
        if is_admin(user):
            return qs
        if is_teacher(user) and hasattr(user, "teacher_profile"):
            return qs.filter(
                Q(student__classroom__class_teacher=user.teacher_profile)
                | Q(student__classroom__subjects__teacher=user.teacher_profile)
            ).distinct()
        if is_student(user):
            return qs.filter(student__user=user)
        return qs.none()
