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

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from users.models import StudentProfile
from .models import StudentFee

class StudentLedgerAPIView(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, student_id):
        try:
            student = StudentProfile.objects.get(id=student_id)
        except StudentProfile.DoesNotExist:
            return Response({"error": "Student not found"}, status=404)

        # Get or create ledger
        fee_ledgers = StudentFee.objects.filter(student=student)
        if not fee_ledgers.exists() and student.classroom:
            plans = FeePlan.objects.filter(classroom=student.classroom, is_active=True)
            for plan in plans:
                StudentFee.objects.get_or_create(student=student, fee_plan=plan, academic_year=plan.academic_year)
            fee_ledgers = StudentFee.objects.filter(student=student)

        fee_ledger = fee_ledgers.first()
        payments = Payment.objects.filter(student=student).order_by("-created_at")
        
        # Serialize payments
        payment_history = PaymentSerializer(payments, many=True).data

        if fee_ledger:
            fee_breakdown = {
                "admission_fee": str(fee_ledger.fee_plan.admission_fee),
                "tuition_fee": str(fee_ledger.fee_plan.tuition_fee),
                "exam_fee": str(fee_ledger.fee_plan.exam_fee),
                "computer_fee": str(fee_ledger.fee_plan.computer_fee),
                "sports_fee": str(fee_ledger.fee_plan.sports_fee),
                "transport_fee": str(fee_ledger.fee_plan.transport_fee),
                "library_fee": str(fee_ledger.fee_plan.library_fee),
                "misc_fee": str(fee_ledger.fee_plan.misc_fee),
                "discount": str(fee_ledger.discount),
                "scholarship": str(fee_ledger.scholarship),
                "waived_amount": str(fee_ledger.waived_amount),
                "late_fee": str(fee_ledger.fee_plan.late_fee),
                "gross_fee": str(fee_ledger.gross_fee),
                "grand_total": str(fee_ledger.total_fee),
            }
            total_fee = str(fee_ledger.total_fee)
            gross_fee = str(fee_ledger.gross_fee)
            total_paid = str(fee_ledger.amount_paid)
            remaining_balance = str(fee_ledger.remaining_balance)
            discount = str(fee_ledger.discount)
            scholarship = str(fee_ledger.scholarship)
            waiver = str(fee_ledger.waived_amount)
        else:
            fee_breakdown = {}
            total_fee = "0.00"
            gross_fee = "0.00"
            total_paid = "0.00"
            remaining_balance = "0.00"
            discount = "0.00"
            scholarship = "0.00"
            waiver = "0.00"

        return Response({
            "total_fee": total_fee,
            "gross_fee": gross_fee,
            "total_paid": total_paid,
            "remaining_balance": remaining_balance,
            "discount": discount,
            "scholarship": scholarship,
            "waiver": waiver,
            "fee_breakdown": fee_breakdown,
            "payment_history": payment_history
        })
