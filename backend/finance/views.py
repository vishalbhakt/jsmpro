from django.db.models import Q
from rest_framework import viewsets

from users.permissions import IsAdminOrReadOnly, is_admin, is_student, is_teacher

from .models import FeePlan, Payment
from .serializers import FeePlanSerializer, PaymentSerializer


from rest_framework.pagination import PageNumberPagination
from rest_framework import permissions

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

class IsAdminOrStudentCreateOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        if request.method == "POST":
            return bool(request.user and request.user.is_authenticated and (is_admin(request.user) or is_student(request.user)))
        return is_admin(request.user)

class FeePlanViewSet(viewsets.ModelViewSet):
    serializer_class = FeePlanSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = StandardResultsSetPagination
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
    permission_classes = [IsAdminOrStudentCreateOrReadOnly]
    pagination_class = StandardResultsSetPagination
    search_fields = ["student__user__first_name", "student__user__last_name", "transaction_id", "status"]
    ordering_fields = ["created_at", "paid_at", "amount", "status"]

    def perform_create(self, serializer):
        user = self.request.user
        if is_student(user) and hasattr(user, "student_profile"):
            serializer.save(student=user.student_profile, status="paid")
        else:
            serializer.save()

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
            qs = qs.filter(student__user=user)
        elif not is_admin(user) and not is_teacher(user):
            qs = qs.none()

        # Dynamic query filters
        student = self.request.query_params.get("student")
        if student:
            qs = qs.filter(student_id=student)
            
        classroom = self.request.query_params.get("classroom")
        if classroom:
            qs = qs.filter(student__classroom_id=classroom)
            
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
            
        payment_type = self.request.query_params.get("payment_type")
        if payment_type:
            qs = qs.filter(payment_type=payment_type)
            
        start_date = self.request.query_params.get("start_date")
        if start_date:
            qs = qs.filter(created_at__date__gte=start_date)
            
        end_date = self.request.query_params.get("end_date")
        if end_date:
            qs = qs.filter(created_at__date__lte=end_date)

        return qs
