from rest_framework import serializers
from academics.models import ClassRoom
from .models import Assignment, AssignmentSubmission, Note, Quiz, VideoLecture


class ResourceSerializerMixin(serializers.ModelSerializer):
    classroom_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    teacher_name = serializers.SerializerMethodField()
    classroom = serializers.PrimaryKeyRelatedField(
        queryset=ClassRoom.objects.all(), required=False, allow_null=True
    )

    def get_classroom_name(self, obj):
        return str(obj.classroom) if obj.classroom else None

    def get_teacher_name(self, obj):
        return obj.teacher.user.full_name if obj.teacher else None

    def validate(self, attrs):
        if not attrs.get("classroom") and attrs.get("subject"):
            attrs["classroom"] = attrs["subject"].classroom
        return attrs


class NoteSerializer(ResourceSerializerMixin):
    class Meta:
        model = Note
        fields = [
            "id",
            "classroom",
            "classroom_name",
            "subject",
            "subject_name",
            "teacher",
            "teacher_name",
            "title",
            "description",
            "file",
            "is_published",
            "published_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class VideoLectureSerializer(ResourceSerializerMixin):
    class Meta:
        model = VideoLecture
        fields = [
            "id",
            "classroom",
            "classroom_name",
            "subject",
            "subject_name",
            "teacher",
            "teacher_name",
            "title",
            "description",
            "video_url",
            "video_file",
            "thumbnail",
            "duration_minutes",
            "is_published",
            "published_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class AssignmentSerializer(ResourceSerializerMixin):
    submission_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id",
            "classroom",
            "classroom_name",
            "subject",
            "subject_name",
            "teacher",
            "teacher_name",
            "title",
            "description",
            "due_at",
            "attachment",
            "points",
            "status",
            "submission_count",
            "is_published",
            "published_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.full_name", read_only=True)
    assignment_title = serializers.CharField(source="assignment.title", read_only=True)

    class Meta:
        model = AssignmentSubmission
        fields = [
            "id",
            "assignment",
            "assignment_title",
            "student",
            "student_name",
            "text_answer",
            "file",
            "submitted_at",
            "grade",
            "feedback",
            "status",
            "updated_at",
        ]
        read_only_fields = ["submitted_at", "updated_at"]


class QuizSerializer(ResourceSerializerMixin):
    class Meta:
        model = Quiz
        fields = [
            "id",
            "classroom",
            "classroom_name",
            "subject",
            "subject_name",
            "teacher",
            "teacher_name",
            "title",
            "description",
            "instructions",
            "total_questions",
            "max_marks",
            "starts_at",
            "ends_at",
            "is_published",
            "published_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
