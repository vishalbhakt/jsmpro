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
    classroom_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "user_name",
            "email",
            "admission_number",
            "roll_number",
            "classroom",
            "classroom_name",
            "date_of_birth",
            "guardian_name",
            "guardian_phone",
            "blood_group",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_classroom_name(self, obj):
        return str(obj.classroom) if obj.classroom else None


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
            return {
                "id": obj.student_profile.id,
                "admission_number": obj.student_profile.admission_number,
                "classroom": obj.student_profile.classroom_id,
            }
        if obj.role == User.Roles.TEACHER and hasattr(obj, "teacher_profile"):
            return {
                "id": obj.teacher_profile.id,
                "employee_id": obj.teacher_profile.employee_id,
                "designation": obj.teacher_profile.designation,
            }
        return None


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
