# finance_audit.py
"""
Finance Audit Script
--------------------
Generates a comprehensive markdown audit of the finance module:
- Fee plans (total amount, active/inactive counts)
- Payments summary (total received, pending, failed, refunded)
- Overdue fee plans (due date passed without a paid payment)
- Per‑classroom aggregates

Run the script from the project root after activating the virtual environment:
    python backend/finance_audit.py
The output is printed to stdout and also saved as `finance_audit.md` in the project root.
"""

import os
import sys
from datetime import date

# ---------------------------------------------------------------------------
# Django setup
# ---------------------------------------------------------------------------
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)
# The project's settings module lives in the `config` package
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django

django.setup()

# ---------------------------------------------------------------------------
# Imports
# ---------------------------------------------------------------------------
from finance.models import FeePlan, Payment
from django.db.models import Sum, Count, Q

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------
def format_currency(value):
    return f"${value:,.2f}" if value is not None else "-"

def feeplan_report():
    total_plans = FeePlan.objects.count()
    active_plans = FeePlan.objects.filter(is_active=True).count()
    total_amount = FeePlan.objects.aggregate(total=Sum('amount'))['total'] or 0
    overdue_plans = FeePlan.objects.filter(is_active=True, due_date__lt=date.today()).exclude(
        payments__status=Payment.Status.PAID
    ).distinct()
    return {
        'total_plans': total_plans,
        'active_plans': active_plans,
        'total_amount': total_amount,
        'overdue_count': overdue_plans.count(),
        'overdue_items': overdue_plans,
    }

def payment_report():
    payments = Payment.objects.all()
    summary = payments.values('status').annotate(cnt=Count('id'), amount=Sum('amount'))
    total_received = payments.filter(status=Payment.Status.PAID).aggregate(total=Sum('amount'))['total'] or 0
    return {
        'total_payments': payments.count(),
        'total_received': total_received,
        'status_summary': summary,
    }

def classroom_summary():
    # Aggregate per classroom via related FeePlan
    from academics.models import ClassRoom
    data = ClassRoom.objects.annotate(
        plans=Count('fee_plans', distinct=True),
        payments=Count('fee_plans__payments', distinct=True),
        received=Sum('fee_plans__payments__amount', filter=Q(fee_plans__payments__status=Payment.Status.PAID))
    )
    return data

# ---------------------------------------------------------------------------
# Main report generation
# ---------------------------------------------------------------------------
def generate_report():
    fp = feeplan_report()
    pay = payment_report()
    classrooms = classroom_summary()

    lines = []
    lines.append('# Finance Audit Report')
    lines.append('')
    lines.append('## Fee Plans')
    lines.append(f"- Total plans: {fp['total_plans']}")
    lines.append(f"- Active plans: {fp['active_plans']}")
    lines.append(f"- Total amount (all plans): {format_currency(fp['total_amount'])}")
    lines.append(f"- Overdue active plans: {fp['overdue_count']}")
    if fp['overdue_count']:
        lines.append('')
        lines.append('### Overdue Plans')
        lines.append('| ID | Title | Classroom | Due Date | Amount |')
        lines.append('| -- | ----- | --------- | -------- | ------ |')
        for plan in fp['overdue_items']:
            lines.append(f"| {plan.id} | {plan.title} | {plan.classroom_id} | {plan.due_date} | {format_currency(plan.amount)} |")

    lines.append('')
    lines.append('## Payments')
    lines.append(f"- Total payments recorded: {pay['total_payments']}")
    lines.append(f"- Total amount received (PAID): {format_currency(pay['total_received'])}")
    lines.append('')
    lines.append('### Payments by Status')
    lines.append('| Status | Count | Amount |')
    lines.append('| ------ | ----- | ------ |')
    for entry in pay['status_summary']:
        lines.append(f"| {entry['status']} | {entry['cnt']} | {format_currency(entry['amount'])} |")

    lines.append('')
    lines.append('## Classroom Summary')
    lines.append('| Classroom ID | Plans | Payments | Received |')
    lines.append('| ------------ | ----- | -------- | -------- |')
    for cls in classrooms:
        lines.append(f"| {cls.id} | {cls.plans} | {cls.payments} | {format_currency(cls.received)} |")

    markdown = "\n".join(lines)
    print(markdown)

    report_path = os.path.join(project_root, 'finance_audit.md')
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(markdown)
    print(f"\nReport written to {report_path}")

if __name__ == '__main__':
    generate_report()
