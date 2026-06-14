from rest_framework import serializers

from .models import Assessment, ClassRoom, Result, Subject


class ClassRoomSerializer(serializers.ModelSerializer):
    class_teacher_name = serializers.SerializerMethodField()
    student_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ClassRoom
        fields = [
            "id",
            "name",
            "section",
            "academic_year",
            "capacity",
            "class_teacher",
            "class_teacher_name",
            "student_count",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_class_teacher_name(self, obj):
        return obj.class_teacher.user.full_name if obj.class_teacher else None


class SubjectSerializer(serializers.ModelSerializer):
    classroom_name = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            "id",
            "classroom",
            "classroom_name",
            "teacher",
            "teacher_name",
            "name",
            "code",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_classroom_name(self, obj):
        return str(obj.classroom)

    def get_teacher_name(self, obj):
        return obj.teacher.user.full_name if obj.teacher else None


class AssessmentSerializer(serializers.ModelSerializer):
    classroom_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = [
            "id",
            "classroom",
            "classroom_name",
            "subject",
            "subject_name",
            "title",
            "assessment_type",
            "max_marks",
            "scheduled_for",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_classroom_name(self, obj):
        return str(obj.classroom)

    def get_created_by_name(self, obj):
        return obj.created_by.user.full_name if obj.created_by else None


class ResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.full_name", read_only=True)
    assessment_title = serializers.CharField(source="assessment.title", read_only=True)
    subject_name = serializers.CharField(source="assessment.subject.name", read_only=True)
    max_marks = serializers.DecimalField(source="assessment.max_marks", max_digits=6, decimal_places=2, read_only=True)

    class Meta:
        model = Result
        fields = [
            "id",
            "assessment",
            "assessment_title",
            "subject_name",
            "max_marks",
            "student",
            "student_name",
            "marks_obtained",
            "grade",
            "remarks",
            "published_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
