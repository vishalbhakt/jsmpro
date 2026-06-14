from rest_framework import serializers

from .models import AttendanceRecord, AttendanceSession


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.full_name", read_only=True)
    roll_number = serializers.CharField(source="student.roll_number", read_only=True)
    session_date = serializers.DateField(source="session.date", read_only=True)
    subject_name = serializers.CharField(source="session.subject.name", read_only=True)
    classroom_name = serializers.CharField(source="session.classroom.name", read_only=True)
    taken_by_name = serializers.CharField(source="session.taken_by.user.full_name", read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            "id",
            "session",
            "session_date",
            "subject_name",
            "classroom_name",
            "taken_by_name",
            "student",
            "student_name",
            "roll_number",
            "status",
            "remarks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class AttendanceSessionSerializer(serializers.ModelSerializer):
    classroom_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    taken_by_name = serializers.SerializerMethodField()
    records = AttendanceRecordSerializer(many=True, read_only=True)

    class Meta:
        model = AttendanceSession
        fields = [
            "id",
            "classroom",
            "classroom_name",
            "subject",
            "subject_name",
            "date",
            "taken_by",
            "taken_by_name",
            "notes",
            "records",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_classroom_name(self, obj):
        return str(obj.classroom)

    def get_taken_by_name(self, obj):
        return obj.taken_by.user.full_name if obj.taken_by else None
