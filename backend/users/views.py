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
        from academics.models import Assessment, Subject, Result
        from attendance.models import AttendanceRecord
        from finance.models import Payment, FeePlan
        from learning.models import Assignment, AssignmentSubmission, Note, VideoLecture, Quiz
        from communication.models import Announcement, Notification
        
        stats = []
        today_events = []
        performance = []
        summary = None
        
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
                import datetime
                now = timezone.now()
                
                # 1. Assignments
                total_assignments = Assignment.objects.filter(classroom=sp.classroom, is_published=True).count()
                completed_assignments = AssignmentSubmission.objects.filter(student=sp).count()
                pending_assignments = max(0, total_assignments - completed_assignments)
                due_today = Assignment.objects.filter(classroom=sp.classroom, is_published=True, due_at__date=now.date()).count()
                overdue = Assignment.objects.filter(
                    classroom=sp.classroom, 
                    is_published=True, 
                    due_at__lt=now
                ).exclude(
                    submissions__student=sp
                ).count()
                
                # 2. Fees
                from django.db.models import Sum
                total_fee = FeePlan.objects.filter(classroom=sp.classroom).aggregate(total=Sum('amount'))['total'] or 0
                paid_amount = Payment.objects.filter(student=sp, status='paid').aggregate(total=Sum('amount'))['total'] or 0
                remaining_fee = max(0, total_fee - paid_amount)
                
                # 3. Attendance
                present_count = AttendanceRecord.objects.filter(student=sp, status='present').count()
                absent_count = AttendanceRecord.objects.filter(student=sp, status='absent').count()
                late_count = AttendanceRecord.objects.filter(student=sp, status='late').count()
                leave_count = AttendanceRecord.objects.filter(student=sp, status='excused').count()
                total_att = present_count + absent_count + late_count + leave_count
                att_percentage = int((present_count + late_count + leave_count) / total_att * 100) if total_att > 0 else None
                
                # Stats card
                stats = [
                    {
                        "label": "Pending Assignments", 
                        "value": str(pending_assignments) if pending_assignments > 0 else "No pending assignments", 
                        "trend": f"{completed_assignments} completed | {due_today} due today | {overdue} overdue"
                    },
                    {
                        "label": "Pending Fees", 
                        "value": f"₹{remaining_fee}" if remaining_fee > 0 else "Fully Paid", 
                        "trend": f"Total: ₹{total_fee} | Paid: ₹{paid_amount}"
                    },
                    {
                        "label": "Attendance", 
                        "value": f"{att_percentage}%" if att_percentage is not None else "Attendance not available yet", 
                        "trend": f"{present_count} Pres | {absent_count} Abs | {late_count} Late | {leave_count} Leave" if total_att > 0 else "No records"
                    },
                    {
                        "label": "Profile Status", 
                        "value": sp.status.title() if sp.status else "Active", 
                        "trend": f"Roll: {sp.roll_number or 'N/A'}"
                    },
                ]
                
                # 4. Updates Feed
                updates = []
                # Announcements
                announcements = Announcement.objects.filter(
                    Q(classroom=sp.classroom) | Q(classroom__isnull=True)
                ).order_by('-created_at')[:4]
                for a in announcements:
                    updates.append([
                        "Announcement",
                        a.title,
                        a.created_at.date().isoformat(),
                        a.created_at.time().strftime("%H:%M"),
                        "unread"
                    ])
                # New Assignments
                new_assignments = Assignment.objects.filter(classroom=sp.classroom, is_published=True).order_by('-published_at')[:4]
                for ass in new_assignments:
                    updates.append([
                        "Assignment",
                        f"Task: {ass.title} is assigned",
                        ass.published_at.date().isoformat(),
                        ass.published_at.time().strftime("%H:%M"),
                        "unread"
                    ])
                # New Notes
                new_notes = Note.objects.filter(classroom=sp.classroom, is_published=True).order_by('-published_at')[:4]
                for n in new_notes:
                    updates.append([
                        "Handout",
                        f"Notes: {n.title} uploaded",
                        n.published_at.date().isoformat(),
                        n.published_at.time().strftime("%H:%M"),
                        "unread"
                    ])
                # New Videos
                new_videos = VideoLecture.objects.filter(classroom=sp.classroom, is_published=True).order_by('-published_at')[:4]
                for v in new_videos:
                    updates.append([
                        "Video Lesson",
                        f"Lecture: {v.title} published",
                        v.published_at.date().isoformat(),
                        v.published_at.time().strftime("%H:%M"),
                        "unread"
                    ])
                
                updates.sort(key=lambda x: f"{x[2]}T{x[3]}", reverse=True)
                today_events = updates[:8]
                
                # 5. Performance calculations
                results = Result.objects.filter(student=sp)
                total_percentage = 0.0
                eval_count = 0
                subject_scores = {}
                monthly_scores = {}
                
                for r in results:
                    max_marks = float(r.assessment.max_marks) if r.assessment and r.assessment.max_marks else 100.0
                    obtained = float(r.marks_obtained)
                    percent = (obtained / max_marks * 100) if max_marks > 0 else 0.0
                    total_percentage += percent
                    eval_count += 1
                    
                    sub_name = r.assessment.subject.name
                    if sub_name not in subject_scores:
                        subject_scores[sub_name] = []
                    subject_scores[sub_name].append(percent)
                    
                    month_name = r.created_at.strftime("%b")
                    if month_name not in monthly_scores:
                        monthly_scores[month_name] = []
                    monthly_scores[month_name].append(percent)
                
                overall_percentage = round(total_percentage / eval_count, 1) if eval_count > 0 else None
                overall_grade = "N/A"
                if overall_percentage is not None:
                    if overall_percentage >= 90: overall_grade = "A+"
                    elif overall_percentage >= 80: overall_grade = "A"
                    elif overall_percentage >= 70: overall_grade = "B"
                    elif overall_percentage >= 60: overall_grade = "C"
                    elif overall_percentage >= 50: overall_grade = "D"
                    else: overall_grade = "F"
                
                subject_performance = [
                    {"name": sub, "results": round(sum(scores)/len(scores), 1)}
                    for sub, scores in subject_scores.items()
                ]
                # Default performance fallback or trend mapping
                performance = [
                    {"name": month, "results": round(sum(scores)/len(scores), 1)}
                    for month, scores in monthly_scores.items()
                ]
                if not performance and overall_percentage is not None:
                    performance = [{"name": "Overall", "results": overall_percentage}]
                
                # 6. Summary metrics
                total_subjects = Subject.objects.filter(classroom=sp.classroom).count()
                upcoming_assignments = Assignment.objects.filter(classroom=sp.classroom, is_published=True, due_at__gt=now).count()
                
                last_result = Result.objects.filter(student=sp).order_by('-created_at').first()
                latest_result_str = f"{last_result.assessment.title} - {last_result.grade} ({last_result.marks_obtained}/{last_result.assessment.max_marks})" if last_result else "No graded results yet"
                
                unread_notifications = Notification.objects.filter(recipient=user, read_at__isnull=True).count()
                learning_resources_available = Note.objects.filter(classroom=sp.classroom, is_published=True).count() + VideoLecture.objects.filter(classroom=sp.classroom, is_published=True).count()
                
                summary = {
                    "total_subjects": total_subjects,
                    "upcoming_assignments": upcoming_assignments,
                    "attendance_percentage": f"{att_percentage}%" if att_percentage is not None else "N/A",
                    "latest_result": latest_result_str,
                    "unread_notifications": unread_notifications,
                    "learning_resources_available": learning_resources_available,
                    "overall_percentage": overall_percentage,
                    "overall_grade": overall_grade,
                    "subject_performance": subject_performance
                }
            except Exception as ex:
                print("Student stats calculation error:", ex)
                pass

        if not today_events:
            today_events.append(["System", "Welcome to JSM Dashboard", timezone.now().date().isoformat(), timezone.now().time().strftime("%H:%M"), "read"])
            
        return Response({
            "stats": stats,
            "performance": performance,
            "today": today_events,
            "summary": summary
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


class PublicStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        from users.models import User
        from cms.models import Course
        student_count = User.objects.filter(role=User.Roles.STUDENT).count()
        teacher_count = User.objects.filter(role=User.Roles.TEACHER).count()
        course_count = Course.objects.filter(is_published=True).count()
        return Response({
            "students": student_count,
            "teachers": teacher_count,
            "courses": course_count,
            "excellence_years": 12
        })


from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

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
        user.registration_status = 'approved'
        user.approved_at = timezone.now()
        if request.user.is_authenticated:
            user.approved_by = request.user
        user.save()
        
        if hasattr(user, 'student_profile'):
            profile = user.student_profile
            profile.status = 'active'
            profile.save()
        elif hasattr(user, 'teacher_profile'):
            profile = user.teacher_profile
            profile.status = 'active'
            profile.save()
            
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
    pagination_class = StandardResultsSetPagination
    search_fields = ["user__first_name", "user__last_name", "admission_number", "roll_number", "user__email", "user__phone"]
    ordering_fields = ["created_at", "roll_number", "admission_number"]

    def get_queryset(self):
        qs = StudentProfile.objects.select_related("user", "classroom", "classroom__class_teacher").order_by("-created_at")
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
        if "phone" in data:
            user.phone = data["phone"]
            user_updated = True
        if user_updated:
            user.save()
        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=["get", "patch"], url_path="my-profile")
    @transaction.atomic
    def my_profile(self, request):
        """Teacher can view/update their own TeacherProfile fields."""
        user = request.user
        if not is_teacher(user):
            return Response({"error": "Not a teacher"}, status=403)
        try:
            tp = user.teacher_profile
        except TeacherProfile.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=404)

        if request.method == "GET":
            serializer = TeacherProfileSerializer(tp, context={"request": request})
            return Response(serializer.data)

        # PATCH - update TeacherProfile fields
        data = request.data
        for field in ["qualification", "designation", "bio", "joined_on", "status"]:
            if field in data:
                setattr(tp, field, data[field])
        tp.save()

        # Also update related User fields
        u = user
        u_changed = False
        for field in ["first_name", "last_name", "phone"]:
            if field in data:
                setattr(u, field, data[field])
                u_changed = True
        if u_changed:
            u.save()

        serializer = TeacherProfileSerializer(tp, context={"request": request})
        return Response(serializer.data)
