# dashboard_stats.py
"""
Dashboard Statistics Report
--------------------------
Generates a concise markdown report with key statistics used on the admin dashboard.
The output includes counts for students, teachers, classes, fee plans, payments, attendance,
and recent announcements.
"""

import os
import sys
from datetime import date, timedelta

# ---------------------------------------------------------------
# Django setup
# ---------------------------------------------------------------
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django

django.setup()

# ---------------------------------------------------------------
# Imports
# ---------------------------------------------------------------
from django.db import models
from users.models import User, TeacherProfile, StudentProfile
from academics.models import ClassRoom
from finance.models import FeePlan, Payment
from attendance.models import AttendanceSession
from communication.models import Announcement

# ---------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------
def fmt_currency(val):
    return f"${val:,.2f}" if val is not None else "-"

def recent_announcements(limit=5):
    return (
        Announcement.objects.filter(published_at__isnull=False)
        .order_by('-published_at')[:limit]
    )

# ---------------------------------------------------------------
# Main report generation
# ---------------------------------------------------------------
def generate_report():
    lines = ["# Dashboard Statistics", ""]

    # Users
    total_users = User.objects.count()
    total_teachers = TeacherProfile.objects.count()
    total_students = StudentProfile.objects.count()
    lines.append("## Users")
    lines.append(f"- Total users: {total_users}")
    lines.append(f"- Teachers: {total_teachers}")
    lines.append(f"- Students: {total_students}\n")

    # Classes
    total_classes = ClassRoom.objects.count()
    lines.append("## Classes")
    lines.append(f"- Total classrooms: {total_classes}\n")

    # Finance
    active_fee_plans = FeePlan.objects.filter(is_active=True).count()
    total_fee_amount = (
        FeePlan.objects.filter(is_active=True).aggregate(total=models.Sum('amount'))['total']
    )
    total_payments = Payment.objects.count()
    paid_amount = (
        Payment.objects.filter(status=Payment.Status.PAID).aggregate(total=models.Sum('amount'))['total']
    )
    lines.append("## Finance")
    lines.append(f"- Active fee plans: {active_fee_plans}")
    lines.append(f"- Total fee amount (active): {fmt_currency(total_fee_amount)}")
    lines.append(f"- Payments recorded: {total_payments}")
    lines.append(f"- Total paid amount: {fmt_currency(paid_amount)}\n")

    # Attendance (last 7 days)
    today = date.today()
    recent_sessions = AttendanceSession.objects.filter(date__gte=today - timedelta(days=7)).count()
    lines.append("## Attendance (last 7 days)")
    lines.append(f"- Sessions recorded: {recent_sessions}\n")

    # Recent Announcements
    lines.append("## Recent Announcements")
    for ann in recent_announcements():
        pub = ann.published_at.strftime('%Y-%m-%d') if ann.published_at else 'Unpublished'
        lines.append(f"- {ann.title} (published {pub})")
    lines.append('')

    report = "\n".join(lines)
    print(report)

    out_path = os.path.join(project_root, 'dashboard_statistics.md')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"\nReport written to {out_path}")

if __name__ == '__main__':
    generate_report()
