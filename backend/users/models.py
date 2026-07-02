from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = "admin", "Admin"
        TEACHER = "teacher", "Teacher"
        STUDENT = "student", "Student"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.STUDENT)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    is_verified = models.BooleanField(default=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=80, blank=True)
    state = models.CharField(max_length=80, blank=True)
    country = models.CharField(max_length=80, blank=True)
    pincode = models.CharField(max_length=20, blank=True)
    employee_id = models.CharField(max_length=40, blank=True)
    joining_date = models.DateField(blank=True, null=True)
    profile_visibility = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    system_notifications = models.BooleanField(default=True)
    theme = models.CharField(max_length=20, default="light")
    language = models.CharField(max_length=20, default="en")
    registration_status = models.CharField(
        max_length=20, 
        choices=[('pending', 'Pending Approval'), ('approved', 'Approved'), ('rejected', 'Rejected')], 
        default='approved'
    )
    approved_at = models.DateTimeField(blank=True, null=True)
    approved_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name='approved_users'
    )
    rejected_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.Roles.ADMIN
        super().save(*args, **kwargs)

    @property
    def full_name(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return name or self.username


class TeacherProfile(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ON_LEAVE = "on_leave", "On leave"
        INACTIVE = "inactive", "Inactive"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="teacher_profile")
    employee_id = models.CharField(max_length=40, unique=True)
    alternate_phone = models.CharField(max_length=20, blank=True, null=True, default="")
    pan_number = models.CharField(max_length=20, blank=True, null=True, default="")
    bank_account_no = models.CharField(max_length=40, blank=True, null=True, default="")
    bank_ifsc_code = models.CharField(max_length=20, blank=True, null=True, default="")
    specialization = models.CharField(max_length=150, blank=True, null=True, default="")
    assigned_class = models.CharField(max_length=50, blank=True, null=True, default="")
    signature = models.ImageField(upload_to="signatures/", blank=True, null=True)
    qualification = models.CharField(max_length=160, blank=True)
    designation = models.CharField(max_length=120, default="Teacher")
    department = models.CharField(max_length=120, blank=True)
    subjects_taught = models.CharField(max_length=200, blank=True)
    blood_group = models.CharField(max_length=10, blank=True, null=True, default="")
    emergency_contact = models.CharField(max_length=20, blank=True)
    experience_years = models.IntegerField(default=0)
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)
    certificate = models.FileField(upload_to="certificates/", blank=True, null=True)
    bio = models.TextField(blank=True)
    joined_on = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    is_profile_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.full_name} ({self.employee_id})"


class StudentProfile(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        GRADUATED = "graduated", "Graduated"
        TRANSFERRED = "transferred", "Transferred"
        INACTIVE = "inactive", "Inactive"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")
    admission_number = models.CharField(max_length=40, unique=True)
    roll_number = models.CharField(max_length=30, blank=True)
    classroom = models.ForeignKey(
        "academics.ClassRoom",
        on_delete=models.SET_NULL,
        related_name="students",
        blank=True,
        null=True,
    )
    date_of_birth = models.DateField(blank=True, null=True)
    guardian_name = models.CharField(max_length=120, blank=True)
    guardian_phone = models.CharField(max_length=20, blank=True)
    father_name = models.CharField(max_length=120, blank=True)
    mother_name = models.CharField(max_length=120, blank=True)
    emergency_contact = models.CharField(max_length=20, blank=True)
    house = models.CharField(max_length=80, blank=True)
    bus_route = models.CharField(max_length=80, blank=True)
    aadhaar_number = models.CharField(max_length=20, blank=True)
    blood_group = models.CharField(max_length=10, blank=True, null=True, default="")
    previous_school = models.CharField(max_length=150, blank=True, null=True, default="")
    admission_class = models.CharField(max_length=50, blank=True, null=True, default="")
    
    guardian_occupation = models.CharField(max_length=120, blank=True, null=True, default="")
    birth_certificate = models.FileField(upload_to="birth_certs/", blank=True, null=True)
    student_signature = models.ImageField(upload_to="student_signatures/", blank=True, null=True)
    religion = models.CharField(max_length=50, blank=True, null=True, default="")
    nationality = models.CharField(max_length=50, blank=True, null=True, default="Indian")
    transport = models.CharField(max_length=120, blank=True, null=True, default="")
    medical_notes = models.TextField(blank=True, null=True, default="")
    documents = models.FileField(upload_to="student_docs/", blank=True, null=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    is_profile_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.full_name} ({self.admission_number})"


from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == User.Roles.STUDENT:
            StudentProfile.objects.get_or_create(
                user=instance,
                defaults={"admission_number": f"ADM{instance.id:05d}"}
            )
        elif instance.role == User.Roles.TEACHER:
            TeacherProfile.objects.get_or_create(
                user=instance,
                defaults={"employee_id": f"TEA{instance.id:05d}"}
            )
