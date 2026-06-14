from django.db.models import Q, Count, Avg
from django.utils import timezone
from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import StudentProfile, TeacherProfile, User
from .permissions import IsAdmin, IsAdminOrReadOnly, is_admin, is_student, is_teacher
from .serializers import (
    RegisterSerializer,
    StudentProfileSerializer,
    TeacherProfileSerializer,
    TokenPairSerializer,
    UserSerializer,
)


class DashboardStatsView(APIView):
    def get(self, request, *args, **kwargs):
        user = request.user
        role = getattr(user, 'role', 'student')
        
        # We will import models here to prevent circular imports
        from academics.models import Assessment
        from attendance.models import AttendanceRecord
        from finance.models import Payment
        from learning.models import Assignment, AssignmentSubmission
        from communication.models import Announcement
        
        stats = []
        today_events = []
        
        if role == 'admin':
            student_count = StudentProfile.objects.count()
            teacher_count = TeacherProfile.objects.count()
            total_payments = Payment.objects.filter(status='paid').count()
            total_pending = Payment.objects.filter(status='pending').count()
            fee_perc = int((total_payments / (total_payments + total_pending) * 100)) if (total_payments + total_pending) > 0 else 0
            
            stats = [
                {"label": "Students", "value": str(student_count), "trend": "Total enrolled"},
                {"label": "Teachers", "value": str(teacher_count), "trend": "Total staff"},
                {"label": "Fee Collection", "value": f"{fee_perc}%", "trend": "Paid vs Pending"},
                {"label": "System Users", "value": str(User.objects.count()), "trend": "Total accounts"},
            ]
            for ann in Announcement.objects.order_by('-created_at')[:2]:
                today_events.append(["Announcement", ann.title])
                
        elif role == 'teacher':
            try:
                tp = user.teacher_profile
                assigned_students = StudentProfile.objects.filter(
                    Q(classroom__class_teacher=tp) | Q(classroom__subjects__teacher=tp)
                ).distinct().count()
                assignments = Assignment.objects.filter(subject__teacher=tp).count()
                subs = AssignmentSubmission.objects.filter(assignment__subject__teacher=tp, status='submitted').count()
                
                stats = [
                    {"label": "Assigned Students", "value": str(assigned_students), "trend": "In your classes"},
                    {"label": "Assignments", "value": str(assignments), "trend": "Created by you"},
                    {"label": "Pending Reviews", "value": str(subs), "trend": "To be graded"},
                    {"label": "Classes", "value": str(tp.classrooms.count() if hasattr(tp, 'classrooms') else 0), "trend": "As class teacher"},
                ]
            except Exception:
                pass
                
        else: # student
            try:
                sp = user.student_profile
                pending_assignments = Assignment.objects.filter(subject__classroom=sp.classroom).count() - AssignmentSubmission.objects.filter(student=sp).count()
                pending_fees = Payment.objects.filter(student=sp, status='pending').count()
                
                stats = [
                    {"label": "Pending Assignments", "value": str(pending_assignments), "trend": "To complete"},
                    {"label": "Pending Fees", "value": str(pending_fees), "trend": "Unpaid invoices"},
                    {"label": "Attendance", "value": "N/A", "trend": "Current term"},
                    {"label": "Profile", "value": "Active", "trend": sp.roll_number},
                ]
            except Exception:
                pass

        # Dummy performance data for visual effect since we don't have enough historical data seeded
        performance = [
            {"name": "Jan", "attendance": 90, "results": 75, "fees": 60},
            {"name": "Feb", "attendance": 92, "results": 80, "fees": 70},
            {"name": "Mar", "attendance": 95, "results": 85, "fees": 80},
        ]

        if not today_events:
            today_events.append(["System", "Welcome to JSM Dashboard"])
            
        return Response({
            "stats": stats,
            "performance": performance,
            "today": today_events
        })

class TokenPairView(TokenObtainPairView):
    serializer_class = TokenPairSerializer
    permission_classes = [permissions.AllowAny]


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user, context={"request": request}).data, status=201)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


from rest_framework.decorators import action

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.select_related("student_profile", "teacher_profile").order_by("-created_at")
    search_fields = ["username", "email", "first_name", "last_name", "phone"]
    ordering_fields = ["created_at", "role", "first_name"]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        user = self.get_object()
        user.is_verified = True
        user.is_active = True
        user.save()
        return Response({"status": "user approved"})

    @action(detail=True, methods=["post"])
    def toggle_status(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({"status": "status updated", "is_active": user.is_active})


class StudentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["user__first_name", "user__last_name", "admission_number", "roll_number"]
    ordering_fields = ["created_at", "roll_number", "admission_number"]

    def get_queryset(self):
        qs = StudentProfile.objects.select_related("user", "classroom", "classroom__class_teacher")
        user = self.request.user
        if is_admin(user):
            return qs
        if is_teacher(user) and hasattr(user, "teacher_profile"):
            return qs.filter(
                Q(classroom__class_teacher=user.teacher_profile)
                | Q(classroom__subjects__teacher=user.teacher_profile)
            ).distinct()
        if is_student(user):
            return qs.filter(user=user)
        return qs.none()


class TeacherProfileViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["user__first_name", "user__last_name", "employee_id", "designation"]
    ordering_fields = ["created_at", "employee_id"]

    def get_queryset(self):
        qs = TeacherProfile.objects.select_related("user")
        user = self.request.user
        if is_admin(user) or is_student(user):
            return qs
        if is_teacher(user):
            return qs.filter(user=user)
        return qs.none()
