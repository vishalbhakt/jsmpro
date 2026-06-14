from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import StudentProfile, TeacherProfile, User


class TeacherProfileSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = TeacherProfile
        fields = [
            "id",
            "user",
            "user_name",
            "email",
            "employee_id",
            "qualification",
            "designation",
            "bio",
            "joined_on",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


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
    full_name = serializers.CharField(read_only=True)
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "phone",
            "address",
            "avatar",
            "is_active",
            "is_verified",
            "profile",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

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
