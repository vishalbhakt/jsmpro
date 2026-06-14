from django.contrib import admin

from .models import FeePlan, Payment


@admin.register(FeePlan)
class FeePlanAdmin(admin.ModelAdmin):
    list_display = ("title", "classroom", "amount", "due_date", "is_active")
    list_filter = ("classroom", "is_active", "due_date")
    search_fields = ("title", "description")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("student", "fee_plan", "amount", "status", "method", "paid_at")
    list_filter = ("status", "method", "paid_at")
    search_fields = ("student__user__first_name", "student__user__last_name", "transaction_id")
