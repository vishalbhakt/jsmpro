from django.db.models import Q, Count, Avg
from django.utils import timezone
from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import StudentProfile, TeacherProfile, User
from .permissions import IsAdmin, IsAdminOrReadOnly, is_admin, is_student, is_teacher
from .serializers import (
    ListUserSerializer,
    UserSerializer,
    RegisterSerializer,
    TokenPairSerializer,
    StudentProfileSerializer,
    TeacherProfileSerializer,
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

    def get_status(self, obj):
        return "Active" if obj.is_active else "Inactive"

    def get_profile(self, obj):
        return self.request.user

    def get_object(self):
        return self.request.user


from rest_framework import status

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_new_password = request.data.get("confirm_new_password")

        if not current_password or not new_password or not confirm_new_password:
            return Response({"error": "All password fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(current_password):
            return Response({"current_password": ["Incorrect current password."]}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_new_password:
            return Response({"confirm_new_password": ["Passwords do not match."]}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({"new_password": ["Password must be at least 8 characters long."]}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"status": "Password changed successfully."})


from rest_framework.decorators import action

from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-created_at")
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return ListUserSerializer
        return UserSerializer


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

    @action(detail=True, methods=["post"])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        password = request.data.get("password")
        if not password:
            return Response({"error": "Password is required"}, status=400)
        user.set_password(password)
        user.save()
        return Response({"status": "password reset successful"})


from django.db import transaction

class StudentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["user__first_name", "user__last_name", "admission_number", "roll_number", "user__email", "user__phone"]
    ordering_fields = ["created_at", "roll_number", "admission_number"]

    def get_queryset(self):
        qs = StudentProfile.objects.select_related("user", "classroom", "classroom__class_teacher")
        user = self.request.user
        if is_admin(user):
            pass
        elif is_teacher(user) and hasattr(user, "teacher_profile"):
            qs = qs.filter(
                Q(classroom__class_teacher=user.teacher_profile)
                | Q(classroom__subjects__teacher=user.teacher_profile)
            ).distinct()
        elif is_student(user):
            qs = qs.filter(user=user)
        else:
            return qs.none()

        # Dynamic query filters
        classroom = self.request.query_params.get("classroom")
        if classroom:
            qs = qs.filter(classroom_id=classroom)
            
        section = self.request.query_params.get("section")
        if section:
            qs = qs.filter(classroom__section=section)
            
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
            
        return qs

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if "user" in data:
            return super().create(request, *args, **kwargs)
            
        username = data.get("username") or data.get("email")
        email = data.get("email")
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        password = data.get("password", "Student@12345")
        
        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=User.Roles.STUDENT,
            is_verified=True,
            is_active=True
        )
        user.set_password(password)
        user.save()
        
        classroom_id = data.get("classroom")
        admission_number = data.get("admission_number") or f"ADM{user.id:05d}"
        roll_number = data.get("roll_number")
        
        profile = StudentProfile.objects.create(
            user=user,
            classroom_id=classroom_id,
            admission_number=admission_number,
            roll_number=roll_number
        )
        
        serializer = self.get_serializer(profile)
        return Response(serializer.data, status=201)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        user = instance.user
        user_updated = False
        if "first_name" in data:
            user.first_name = data["first_name"]
            user_updated = True
        if "last_name" in data:
            user.last_name = data["last_name"]
            user_updated = True
        if "email" in data:
            user.email = data["email"]
            user_updated = True
        if user_updated:
            user.save()
        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=["post"])
    def bulk_delete(self, request):
        ids = request.data.get("ids", [])
        profiles = StudentProfile.objects.filter(id__in=ids)
        user_ids = list(profiles.values_list("user_id", flat=True))
        profiles.delete()
        User.objects.filter(id__in=user_ids).delete()
        return Response({"status": "bulk delete successful"})

    @action(detail=False, methods=["post"])
    def bulk_promote(self, request):
        ids = request.data.get("ids", [])
        classroom_id = request.data.get("classroom_id")
        StudentProfile.objects.filter(id__in=ids).update(classroom_id=classroom_id)
        return Response({"status": "bulk promote successful"})

    @action(detail=False, methods=["post"])
    def bulk_assign_class(self, request):
        ids = request.data.get("ids", [])
        classroom_id = request.data.get("classroom_id")
        StudentProfile.objects.filter(id__in=ids).update(classroom_id=classroom_id)
        return Response({"status": "bulk assign class successful"})


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

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if "user" in data:
            return super().create(request, *args, **kwargs)
            
        username = data.get("username") or data.get("email")
        email = data.get("email")
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        password = data.get("password", "Teacher@12345")
        
        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=User.Roles.TEACHER,
            is_verified=True,
            is_active=True
        )
        user.set_password(password)
        user.save()
        
        employee_id = data.get("employee_id") or f"TEA{user.id:05d}"
        designation = data.get("designation", "Assistant Professor")
        specialization = data.get("specialization", "")
        
        profile = TeacherProfile.objects.create(
            user=user,
            employee_id=employee_id,
            designation=designation,
            specialization=specialization
        )
        
        serializer = self.get_serializer(profile)
        return Response(serializer.data, status=201)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        user = instance.user
        user_updated = False
        if "first_name" in data:
            user.first_name = data["first_name"]
            user_updated = True
        if "last_name" in data:
            user.last_name = data["last_name"]
            user_updated = True
        if "email" in data:
            user.email = data["email"]
            user_updated = True
        if user_updated:
            user.save()
        return super().update(request, *args, **kwargs)
