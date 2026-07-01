from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import StudentProfile, TeacherProfile, User


class ListUserSerializer(serializers.ModelSerializer):
    """Serializer for the admin users list – includes all displayed fields."""
    full_name = serializers.CharField(read_only=True)
    role = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "full_name",
            "phone",
            "role",
            "is_active",
            "status",
            "created_at",
        ]
        read_only_fields = fields

    def get_role(self, obj):
        return obj.get_role_display()

    def get_status(self, obj):
        return "Active" if obj.is_active else "Inactive"


class TeacherProfileSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    avatar = serializers.ImageField(source="user.avatar", read_only=True)
    role = serializers.SerializerMethodField()
    phone = serializers.CharField(source="user.phone", read_only=True)
    assigned_subjects = serializers.SerializerMethodField()
    assigned_classes = serializers.SerializerMethodField()
    experience = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True)
    joined_on = serializers.DateField(read_only=True)
    account_info = serializers.SerializerMethodField()


    class Meta:
        model = TeacherProfile
        fields = [
            "id",
            "user",
            "user_name",
            "email",
            "avatar",
            "phone",
            "role",
            "employee_id",
            "qualification",
            "designation",
            "bio",
            "assigned_subjects",
            "assigned_classes",
            "experience",
            "joined_on",
            "status",
            "account_info",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_assigned_subjects(self, obj):
        return list(obj.subjects.values_list('name', flat=True))

    def get_assigned_classes(self, obj):
        return list(obj.classrooms.all().values_list('name', flat=True))

    def get_experience(self, obj):
        if obj.joined_on:
            from datetime import date
            delta = date.today() - obj.joined_on
            years = delta.days // 365
            return f"{years} year(s)"
        return None

    def get_account_info(self, obj):
        return {
            "email": obj.user.email,
            "phone": obj.user.phone,
            "avatar": obj.user.avatar.url if obj.user.avatar else None,
        }

    def get_role(self, obj):
        return obj.user.get_role_display()

class StudentProfileSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    classroom_name = serializers.SerializerMethodField()
    classroom_section = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    attendance_summary = serializers.SerializerMethodField()
    fee_status = serializers.SerializerMethodField()
    results_summary = serializers.SerializerMethodField()
    assigned_subjects = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "user_name",
            "email",
            "phone",
            "avatar",
            "admission_number",
            "roll_number",
            "classroom",
            "classroom_name",
            "classroom_section",
            "date_of_birth",
            "guardian_name",
            "guardian_phone",
            "blood_group",
            "status",
            "attendance_summary",
            "fee_status",
            "results_summary",
            "assigned_subjects",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_classroom_name(self, obj):
        return str(obj.classroom) if obj.classroom else None

    def get_classroom_section(self, obj):
        return obj.classroom.section if obj.classroom else None

    def get_avatar(self, obj):
        request = self.context.get("request")
        if obj.user.avatar:
            url = obj.user.avatar.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_attendance_summary(self, obj):
        from attendance.models import AttendanceRecord
        records = AttendanceRecord.objects.filter(student=obj)
        total = records.count()
        if total == 0:
            return {"percentage": 100.0, "present": 0, "absent": 0, "total": 0}
        present = records.filter(status=AttendanceRecord.Status.PRESENT).count()
        late = records.filter(status=AttendanceRecord.Status.LATE).count()
        absent = records.filter(status=AttendanceRecord.Status.ABSENT).count()
        percentage = round(((present + late) / total) * 100, 1)
        return {
            "percentage": percentage,
            "present": present + late,
            "absent": absent,
            "total": total
        }

    def get_fee_status(self, obj):
        from finance.models import FeePlan, Payment
        if not obj.classroom:
            return "No Classroom"
        plans = FeePlan.objects.filter(classroom=obj.classroom, is_active=True)
        if not plans.exists():
            return "Paid"
        paid_plans_count = Payment.objects.filter(
            student=obj,
            fee_plan__in=plans,
            status=Payment.Status.PAID
        ).values("fee_plan").distinct().count()
        if paid_plans_count >= plans.count():
            return "Paid"
        return "Unpaid"

    def get_results_summary(self, obj):
        from academics.models import Result
        results = Result.objects.filter(student=obj).select_related("assessment", "assessment__subject")
        summary = []
        for r in results:
            summary.append({
                "assessment": r.assessment.title,
                "subject": r.assessment.subject.name if r.assessment.subject else "N/A",
                "marks_obtained": float(r.marks_obtained),
                "max_marks": float(r.assessment.max_marks) if r.assessment else 100.0,
                "percentage": round((float(r.marks_obtained) / float(r.assessment.max_marks)) * 100, 1) if r.assessment and r.assessment.max_marks else 0.0,
                "grade": r.grade,
                "remarks": r.remarks
            })
        return summary

    def get_assigned_subjects(self, obj):
        if not obj.classroom:
            return []
        return list(obj.classroom.subjects.values_list("name", flat=True))


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    profile = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "role",
            "is_active",
            "avatar",
            "created_at",
            "profile",
            "status",
            "date_of_birth",
            "gender",
            "address",
            "bio",
            "city",
            "state",
            "country",
            "pincode",
            "employee_id",
            "joining_date",
            "profile_visibility",
            "email_notifications",
            "system_notifications",
            "theme",
            "language",
            "last_login",
        ]
        read_only_fields = ["id", "full_name", "created_at", "profile", "status", "last_login"]

    def get_role(self, obj):
        return obj.get_role_display()

    def get_status(self, obj):
        return "Active" if obj.is_active else "Inactive"

    def get_profile(self, obj):
        if obj.role == User.Roles.STUDENT and hasattr(obj, "student_profile"):
            sp = obj.student_profile
            return {
                "id": sp.id,
                "admission_number": sp.admission_number,
                "classroom": sp.classroom_id,
                "classroom_name": str(sp.classroom) if sp.classroom else "Unassigned",
                "date_of_birth": sp.date_of_birth.isoformat() if hasattr(sp.date_of_birth, "isoformat") else str(sp.date_of_birth or ""),
                "guardian_name": sp.guardian_name,
                "guardian_phone": sp.guardian_phone,
                "blood_group": sp.blood_group,
                "status": sp.status,
            }
        if obj.role == User.Roles.TEACHER and hasattr(obj, "teacher_profile"):
            tp = obj.teacher_profile
            return {
                "id": tp.id,
                "employee_id": tp.employee_id,
                "designation": tp.designation,
                "qualification": tp.qualification,
                "bio": tp.bio,
                "status": tp.status,
                "joined_on": tp.joined_on.isoformat() if hasattr(tp.joined_on, "isoformat") else str(tp.joined_on or ""),
            }
        return None

    @transaction.atomic
    def update(self, instance, validated_data):
        request = self.context.get("request")
        raw_data = request.data if request else {}

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update StudentProfile
        if instance.role == User.Roles.STUDENT and hasattr(instance, "student_profile"):
            sp = instance.student_profile
            for field in ["date_of_birth", "blood_group", "guardian_name", "guardian_phone"]:
                if field in raw_data:
                    val = raw_data[field]
                    if field == "date_of_birth" and not val:
                        val = None
                    setattr(sp, field, val)
            sp.save()

        # Update TeacherProfile
        if instance.role == User.Roles.TEACHER and hasattr(instance, "teacher_profile"):
            tp = instance.teacher_profile
            for field in ["qualification", "designation", "bio"]:
                if field in raw_data:
                    setattr(tp, field, raw_data[field])
            tp.save()

        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "first_name", "last_name", "role", "phone"]
        extra_kwargs = {"username": {"required": False}}

    def validate(self, attrs):
        if not attrs.get("username"):
            attrs["username"] = attrs["email"]
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.role == User.Roles.STUDENT:
            StudentProfile.objects.create(
                user=user,
                admission_number=f"ADM{user.id:05d}",
            )
        elif user.role == User.Roles.TEACHER:
            TeacherProfile.objects.create(
                user=user,
                employee_id=f"TEA{user.id:05d}",
            )
        return user


class TokenPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        token["full_name"] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user, context=self.context).data
        return data
