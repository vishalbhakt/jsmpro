from django.db import models


class FeePlan(models.Model):
    classroom = models.ForeignKey("academics.ClassRoom", on_delete=models.CASCADE, related_name="fee_plans")
    title = models.CharField(max_length=140)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["due_date"]

    def __str__(self):
        return f"{self.title} - {self.classroom}"


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    class Method(models.TextChoices):
        CASH = "cash", "Cash"
        UPI = "upi", "UPI"
        CARD = "card", "Card"
        BANK_TRANSFER = "bank_transfer", "Bank transfer"
        ONLINE = "online", "Online"

    student = models.ForeignKey("users.StudentProfile", on_delete=models.CASCADE, related_name="payments")
    fee_plan = models.ForeignKey(FeePlan, on_delete=models.SET_NULL, related_name="payments", blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.ONLINE)
    transaction_id = models.CharField(max_length=100, blank=True)
    receipt = models.FileField(upload_to="receipts/", blank=True, null=True)
    paid_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student} - {self.amount} - {self.status}"
