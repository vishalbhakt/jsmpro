# pending_dues_report.py
"""
Pending Dues Report
------------------
Generates a markdown report of unpaid overdue active fee plans.
"""

import os
import sys
from datetime import date

# Django setup
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django

django.setup()

from finance.models import FeePlan

def fmt_currency(val):
    return f"${val:,.2f}" if val is not None else "-"

def unpaid_overdue_plans():
    """Active fee plans whose due date has passed and have no PAID payment."""
    overdue = FeePlan.objects.filter(is_active=True, due_date__lt=date.today())
    # Exclude any plan that already has a PAID payment record
    overdue = overdue.exclude(payments__status=FeePlan.payments.rel.related_model.Status.PAID).distinct()
    return overdue

def generate_report():
    lines = ["# Pending Dues Report", ""]
    overdue = unpaid_overdue_plans()
    lines.append('## Unpaid Overdue Active Fee Plans')
    lines.append(f"Count: {overdue.count()}")
    if overdue:
        lines.append('| ID | Title | Due Date | Amount | Classroom |')
        lines.append('| -- | ----- | -------- | ------ | --------- |')
        for p in overdue:
            lines.append(f"| {p.id} | {p.title} | {p.due_date} | {fmt_currency(p.amount)} | {p.classroom_id} |")
    lines.append('')
    report = "\n".join(lines)
    print(report)
    out_path = os.path.join(project_root, 'pending_dues_report.md')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"\nReport written to {out_path}")

if __name__ == '__main__':
    generate_report()
