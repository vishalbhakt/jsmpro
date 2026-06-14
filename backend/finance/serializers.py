from rest_framework import serializers

from .models import FeePlan, Payment


class FeePlanSerializer(serializers.ModelSerializer):
    classroom_name = serializers.SerializerMethodField()

    class Meta:
        model = FeePlan
        fields = [
            "id",
            "classroom",
            "classroom_name",
            "title",
            "description",
            "amount",
            "due_date",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_classroom_name(self, obj):
        return str(obj.classroom)


class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.full_name", read_only=True)
    fee_title = serializers.CharField(source="fee_plan.title", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "student",
            "student_name",
            "fee_plan",
            "fee_title",
            "amount",
            "status",
            "method",
            "transaction_id",
            "receipt",
            "paid_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
