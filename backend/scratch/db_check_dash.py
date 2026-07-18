import os
import sys
import django

# Setup Django Environment
sys.path.append("E:\\deploy\\jsm_production\\backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.db import connection
from django.db.models import Sum, Q, Count, OuterRef, Subquery, DecimalField
from django.db.models.functions import Coalesce
from django.utils import timezone
from users.models import StudentProfile, TeacherProfile
from academics.models import ClassRoom, Subject
from finance.models import Payment, StudentFee, FeePlan, AdditionalFeeItem
from attendance.models import AttendanceRecord, AttendanceSession

print("Starting DB diagnostic for dashboard stats...")

# Test Subquery
additional_items_subquery = AdditionalFeeItem.objects.filter(
    fee_plan=OuterRef('fee_plan'),
    is_mandatory_for_class=True
).values('fee_plan').annotate(
    total=Sum('amount')
).values('total')

total_stats = StudentFee.objects.filter(
    student__user__is_active=True,
    fee_plan__is_active=True
).annotate(
    mandatory_sum=Coalesce(Subquery(additional_items_subquery), 0, output_field=DecimalField())
).aggregate(
    total_admission=Sum('fee_plan__admission_fee'),
    total_tuition=Sum('fee_plan__tuition_fee'),
    total_exam=Sum('fee_plan__exam_fee'),
    total_computer=Sum('fee_plan__computer_fee'),
    total_library=Sum('fee_plan__library_fee'),
    total_sports=Sum('fee_plan__sports_fee'),
    total_transport=Sum('fee_plan__transport_fee'),
    total_misc=Sum('fee_plan__misc_fee'),
    total_mandatory=Sum('mandatory_sum'),
    total_discount=Sum('discount'),
    total_scholarship=Sum('scholarship'),
    total_waived=Sum('waived_amount'),
)

print("total_stats =", total_stats)

gross_total = (
    (total_stats['total_admission'] or 0) +
    (total_stats['total_tuition'] or 0) +
    (total_stats['total_exam'] or 0) +
    (total_stats['total_computer'] or 0) +
    (total_stats['total_library'] or 0) +
    (total_stats['total_sports'] or 0) +
    (total_stats['total_transport'] or 0) +
    (total_stats['total_misc'] or 0) +
    (total_stats['total_mandatory'] or 0)
)
net_due = gross_total - (total_stats['total_discount'] or 0) - (total_stats['total_scholarship'] or 0) - (total_stats['total_waived'] or 0)
print("net_due =", net_due)

# Total paid across active fees:
total_paid = Payment.objects.filter(
    student__user__is_active=True,
    status='paid'
).aggregate(total=Sum('amount'))['total'] or 0
print("total_paid =", total_paid)

pending_fees = max(net_due - total_paid, 0)
print("pending_fees =", pending_fees)
