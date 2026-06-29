# student_fee_receipt.py
"""
Student Fee Receipt
-------------------
Generates a markdown receipt for a given student ID, showing the fee plan(s) and related payments.
Usage:
    python backend/student_fee_receipt.py --student-id <ID>
"""

import os
import sys
import argparse
from datetime import date

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
from users.models import StudentProfile
from finance.models import FeePlan, Payment

# ---------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------
def fmt_currency(val):
    return f"${val:,.2f}" if val is not None else "-"

def fmt_date(d):
    return d.strftime('%Y-%m-%d') if d else "-"

# ---------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------
def generate_receipt(student_id: int):
    try:
        student = StudentProfile.objects.get(id=student_id)
    except StudentProfile.DoesNotExist:
        print(f"Student with ID {student_id} not found.")
        return

    # Payments linked to this student
    payments = Payment.objects.filter(student_id=student_id).select_related('fee_plan')
    # Distinct fee plans from those payments
    fee_plans = FeePlan.objects.filter(id__in=payments.values_list('fee_plan_id', flat=True)).distinct()

    lines = ["# Student Fee Receipt", ""]
    lines.append(f"**Student:** {student.get_full_name() or student.id}")
    lines.append(f"**Student ID:** {student.id}\n")

    # Fee Plans section
    lines.append('## Fee Plans')
    if fee_plans:
        lines.append('| ID | Title | Amount | Due Date | Active |')
        lines.append('| -- | ----- | ------ | -------- | ------ |')
        for fp in fee_plans:
            lines.append(
                f"| {fp.id} | {fp.title} | {fmt_currency(fp.amount)} | {fmt_date(fp.due_date)} | {'Yes' if fp.is_active else 'No'} |"
            )
    else:
        lines.append('_No fee plans found for this student._')
    lines.append('')

    # Payments section
    lines.append('## Payments')
    if payments:
        lines.append('| ID | Fee Plan ID | Date | Amount | Transaction ID | Status |')
        lines.append('| -- | ----------- | ---- | ------ | -------------- | ------ |')
        total_paid = 0
        for p in payments:
            total_paid += p.amount or 0
            lines.append(
                f"| {p.id} | {p.fee_plan_id} | {fmt_date(p.payment_date)} | {fmt_currency(p.amount)} | {p.transaction_id or '-'} | {p.get_status_display()} |"
            )
        lines.append('')
        lines.append(f"**Total Paid:** {fmt_currency(total_paid)}")
    else:
        lines.append('_No payments recorded for this student._')

    report = "\n".join(lines)
    print(report)

    out_path = os.path.join(project_root, f'student_{student_id}_receipt.md')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"\nReceipt written to {out_path}")

# ---------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate a markdown receipt for a student fee mapping.')
    parser.add_argument('--student-id', type=int, required=True, help='ID of the student')
    args = parser.parse_args()
    generate_receipt(args.student_id)
