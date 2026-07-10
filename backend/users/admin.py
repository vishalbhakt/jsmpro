from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils import timezone
from communication.models import Notification

from .models import StudentProfile, TeacherProfile, User, PendingRegistration


@admin.action(description="Approve selected registration requests")
def approve_registrations(modeladmin, request, queryset):
    approved_count = 0
    for user in queryset:
        if user.registration_status != 'pending':
            continue
            
        if user.role == User.Roles.STUDENT:
            profile, created = StudentProfile.objects.get_or_create(user=user)
            total_students = StudentProfile.objects.exclude(admission_number="").count()
            seq = total_students + 1
            std_username = f"STD2026{seq:04d}"
            adm_no = f"ADM2026{seq:04d}"
            
            while User.objects.filter(username=std_username).exists():
                seq += 1
                std_username = f"STD2026{seq:04d}"
                adm_no = f"ADM2026{seq:04d}"
                
            user.username = std_username
            profile.admission_number = adm_no
            profile.roll_number = str(seq)
            profile.status = StudentProfile.Status.ACTIVE
            profile.save()
            
        elif user.role == User.Roles.TEACHER:
            profile, created = TeacherProfile.objects.get_or_create(user=user)
            total_teachers = TeacherProfile.objects.exclude(employee_id="").count()
            seq = total_teachers + 1
            tch_username = f"TCH2026{seq:04d}"
            emp_id = f"EMP2026{seq:04d}"
            
            while User.objects.filter(username=tch_username).exists():
                seq += 1
                tch_username = f"TCH2026{seq:04d}"
                emp_id = f"EMP2026{seq:04d}"
                
            user.username = tch_username
            profile.employee_id = emp_id
            profile.status = TeacherProfile.Status.ACTIVE
            profile.save()
            
        user.registration_status = 'approved'
        user.is_active = True
        user.is_verified = True
        user.approved_at = timezone.now()
        user.approved_by = request.user
        user.save()
        
        Notification.objects.create(
            recipient=user,
            title="Congratulations! Account Approved 🎉",
            message="Your school account has been approved by the administrator. You now have full access to your dashboard!"
        )
        approved_count += 1
        
    modeladmin.message_user(request, f"Successfully approved {approved_count} user registrations.")


@admin.action(description="Reject selected registration requests")
def reject_registrations(modeladmin, request, queryset):
    rejected_count = 0
    for user in queryset:
        if user.registration_status != 'pending':
            continue
        user.registration_status = 'rejected'
        user.is_active = False
        user.rejected_reason = "Rejected via admin actions."
        user.save()
        rejected_count += 1
    modeladmin.message_user(request, f"Successfully rejected {rejected_count} user registrations.")


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "first_name", "last_name", "role", "is_active")
    list_filter = ("role", "is_active", "is_staff", "is_verified")
    search_fields = ("username", "email", "first_name", "last_name", "phone")
    fieldsets = UserAdmin.fieldsets + (
        ("JSM Profile", {"fields": ("role", "phone", "address", "avatar", "is_verified")}),
    )


@admin.register(PendingRegistration)
class PendingRegistrationAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "first_name", "last_name", "role", "created_at")
    list_filter = ("role",)
    search_fields = ("username", "email", "first_name", "last_name")
    actions = [approve_registrations, reject_registrations]
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(registration_status='pending')


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ("employee_id", "user", "designation", "status", "joined_on")
    search_fields = ("employee_id", "user__first_name", "user__last_name", "user__email")
    list_filter = ("status", "designation")


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("admission_number", "user", "classroom", "roll_number", "status")
    search_fields = ("admission_number", "roll_number", "user__first_name", "user__last_name")
    list_filter = ("status", "classroom")
