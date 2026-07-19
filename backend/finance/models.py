from django.db import models
from django.conf import settings
from django.utils import timezone
import random


class FeePlan(models.Model):
    class FeeType(models.TextChoices):
        ADMISSION = "admission", "Admission Fee"
        MONTHLY = "monthly", "Monthly Fee"
        ANNUAL = "annual", "Annual Fee"
        EXAM = "exam", "Exam Fee"
        TRANSPORT = "transport", "Transport Fee"
        OTHER = "other", "Other Fee"

    classroom = models.ForeignKey("academics.ClassRoom", on_delete=models.CASCADE, related_name="fee_plans")
    title = models.CharField(max_length=140)
    description = models.TextField(blank=True)
    
    # Financial breakdown fields
    academic_year = models.CharField(max_length=20, default="2026-27")
    admission_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tuition_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    exam_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    computer_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    library_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    sports_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    transport_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    misc_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    scholarship = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    late_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) # Auto calculated sum
    due_date = models.DateField(blank=True, null=True)
    fee_type = models.CharField(max_length=30, choices=FeeType.choices, default=FeeType.ANNUAL)
    payment_frequency_options = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["due_date"]

    def save(self, *args, **kwargs):
        # Calculate amount automatically
        self.amount = (
            self.admission_fee + self.tuition_fee + self.exam_fee +
            self.computer_fee + self.library_fee + self.sports_fee +
            self.transport_fee + self.misc_fee - self.discount - self.scholarship
        )
        super().save(*args, **kwargs)

    @property
    def monthly_fee(self):
        return round(self.amount / 12, 2)

    @property
    def quarterly_fee(self):
        return round(self.amount / 4, 2)

    @property
    def half_yearly_fee(self):
        return round(self.amount / 2, 2)

    def __str__(self):
        return f"{self.title} - {self.classroom}"


class StudentFee(models.Model):
    class Status(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PARTIAL = "partial", "Partial"
        PAID = "paid", "Paid"

    student = models.ForeignKey("users.StudentProfile", on_delete=models.CASCADE, related_name="student_fees")
    fee_plan = models.ForeignKey(FeePlan, on_delete=models.CASCADE, related_name="student_fees")
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    scholarship = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    waived_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    academic_year = models.CharField(max_length=20, default="2026-27")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "fee_plan", "academic_year")

    @property
    def gross_fee(self):
        from decimal import Decimal
        if not self.fee_plan:
            return Decimal("0.00")
        fp = self.fee_plan
        base = fp.admission_fee + fp.tuition_fee + fp.exam_fee + fp.computer_fee + fp.library_fee + fp.sports_fee + fp.transport_fee + fp.misc_fee
        
        # Add mandatory additional fee items
        mandatory_sum = fp.additional_items.filter(is_mandatory_for_class=True).aggregate(
            total=models.Sum("amount")
        )["total"] or Decimal("0.00")
        
        return base + mandatory_sum

    @property
    def total_fee(self):
        from decimal import Decimal
        discount_dec = Decimal(str(self.discount))
        scholarship_dec = Decimal(str(self.scholarship))
        waived_dec = Decimal(str(self.waived_amount))
        base = self.gross_fee - discount_dec - scholarship_dec - waived_dec
        return max(base, Decimal("0.00"))

    @property
    def amount_paid(self):
        from decimal import Decimal
        payments_sum = self.payments.filter(status=Payment.Status.PAID).aggregate(
            total=models.Sum("amount")
        )["total"] or Decimal("0.00")
        return payments_sum

    @property
    def remaining_balance(self):
        from decimal import Decimal
        return max(self.total_fee - self.amount_paid, Decimal("0.00"))

    @property
    def payment_status(self):
        from decimal import Decimal
        paid = self.amount_paid
        total = self.total_fee
        if paid >= total:
            return self.Status.PAID
        elif paid > Decimal("0.00"):
            return self.Status.PARTIAL
        return self.Status.UNPAID

    def __str__(self):
        return f"{self.student.user.full_name} - {self.fee_plan.title} ({self.academic_year})"


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
        BANK_TRANSFER = "bank_transfer", "Bank Transfer"
        ONLINE = "online", "Online Payment Gateway"
        CHEQUE = "cheque", "Cheque"
        DD = "dd", "Demand Draft"

    class PaymentType(models.TextChoices):
        FULL_ANNUAL = "full_annual", "Full Annual Payment"
        MONTHLY_INSTALLMENT = "monthly_installment", "Monthly Installment"
        QUARTERLY = "quarterly", "Quarterly Payment"
        ADMISSION = "admission", "Admission Fee"
        PARTIAL = "partial", "Partial Payment"

    student = models.ForeignKey("users.StudentProfile", on_delete=models.CASCADE, related_name="payments")
    fee_plan = models.ForeignKey(FeePlan, on_delete=models.SET_NULL, related_name="payments", blank=True, null=True)
    student_fee = models.ForeignKey(StudentFee, on_delete=models.SET_NULL, related_name="payments", blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.ONLINE)
    payment_type = models.CharField(max_length=40, choices=PaymentType.choices, default=PaymentType.MONTHLY_INSTALLMENT)
    installment_period = models.CharField(max_length=50, default="Annual") # e.g. "January", "Q1", "H1", "Annual"
    academic_session = models.CharField(max_length=20, default="2026-27")
    receipt_number = models.CharField(max_length=40, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    receipt = models.FileField(upload_to="receipts/", blank=True, null=True)
    proof_attachment = models.FileField(upload_to="proofs/", blank=True, null=True)
    collected_by = models.CharField(max_length=120, default="System Admin")
    paid_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            now = timezone.now()
            self.receipt_number = f"REC-{now.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
        if self.status == self.Status.PAID and not self.paid_at:
            self.paid_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student} - {self.amount} - {self.status}"


class AdditionalFeeItem(models.Model):
    fee_plan = models.ForeignKey(FeePlan, on_delete=models.CASCADE, related_name="additional_items")
    item_name = models.CharField(max_length=150)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_mandatory_for_class = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.item_name} - ₹{self.amount} ({'Mandatory' if self.is_mandatory_for_class else 'Optional'})"
