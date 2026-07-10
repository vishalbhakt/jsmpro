from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import messages

class ProfileOnboardingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated and not request.user.is_superuser and request.user.role != "admin":
            role = request.user.role
            
            if role in ["student", "teacher"]:
                profile = None
                if role == "student" and hasattr(request.user, "student_profile"):
                    profile = request.user.student_profile
                elif role == "teacher" and hasattr(request.user, "teacher_profile"):
                    profile = request.user.teacher_profile
                
                # Check if profile is incomplete
                if profile and not profile.is_profile_complete:
                    path = request.path
                    
                    # Define restricted URLs
                    restricted_patterns = [
                        "/dashboard/student/attendance/",
                        "/dashboard/student/payments/",
                        "/dashboard/student/learning/",
                        "/dashboard/student/assignments/",
                        "/dashboard/student/results/",
                        "/dashboard/teacher/students/",
                        "/dashboard/teacher/attendance/",
                        "/dashboard/teacher/assignments/",
                        "/dashboard/teacher/learning/",
                        "/dashboard/teacher/results/",
                    ]
                    
                    # If requesting a restricted URL, redirect to dashboard overview with warning message
                    if any(path.startswith(pattern) for pattern in restricted_patterns):
                        try:
                            messages.warning(request, "Please complete your profile to unlock all features.")
                        except Exception:
                            pass
                        if role == "student":
                            return redirect("student_overview")
                        else:
                            return redirect("teacher_overview")
                            
        response = self.get_response(request)
        return response
