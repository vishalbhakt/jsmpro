# fee_verify.py
"""
Fee Verification Script
-----------------------
Performs data‑integrity checks on the finance module:
    1. Unpaid active fee plans past their due date with no PAID payment.
    2. Fee plans that have no associated payments at all.
    3. Payments whose amount exceeds the linked fee-plan amount.
    4. PAID payments missing a transaction ID.
    5. Potential duplicate payments (same student, same fee plan, same amount, multiple records).
The script prints a markdown report and also writes `fee_verify_report.md` to the project root.
"""

import os
import sys
from datetime import date

# ---------------------------------------------------------------------------
# Django setup
# ---------------------------------------------------------------------------
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)
# Settings live in the `config` package
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django

django.setup()

# ---------------------------------------------------------------------------
# Imports
# ---------------------------------------------------------------------------
from finance.models import FeePlan, Payment
from django.db.models import Sum, F, Count, Q

# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------
def fmt_currency(val):
    return f"${val:,.2f}" if val is not None else "-"

# ---------------------------------------------------------------------------
# Verification checks
# ---------------------------------------------------------------------------
def unpaid_overdue_plans():
    """Active fee plans whose due date has passed and have no PAID payment."""
    overdue = FeePlan.objects.filter(is_active=True, due_date__lt=date.today())
    # Exclude any plan that already has a PAID payment record
    overdue = overdue.exclude(payments__status=Payment.Status.PAID).distinct()
    return overdue

def plans_without_payments():
    """Fee plans that have never received a payment record."""
    return FeePlan.objects.filter(payments__isnull=True)

def payments_exceeding_plan():
    """Payments where the amount is greater than the associated fee‑plan amount."""
    return Payment.objects.filter(fee_plan__isnull=False, amount__gt=F('fee_plan__amount'))

def paid_missing_txid():
    """PAID payments that lack a transaction identifier."""
    return Payment.objects.filter(status=Payment.Status.PAID, transaction_id='')

def duplicate_payments():
    """Detect groups of payments that share student, fee‑plan and amount (count > 1)."""
    return (
        Payment.objects.values('student_id', 'fee_plan_id', 'amount')
        .annotate(cnt=Count('id'))
        .filter(cnt__gt=1)
    )

# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------
def generate_report():
    lines = ["# Fee Verification Report", ""]

    # 1 Unpaid overdue active plans
    overdue = unpaid_overdue_plans()
    lines.append('## 1 Unpaid Overdue Active Fee Plans')
    lines.append(f"Count: {overdue.count()}")
    if overdue:
        lines.append('| ID | Title | Due Date | Amount | Classroom |')
        lines.append('| -- | ----- | -------- | ------ | --------- |')
        for p in overdue:
            lines.append(f"| {p.id} | {p.title} | {p.due_date} | {fmt_currency(p.amount)} | {p.classroom_id} |")
    lines.append('')

    # 2 Plans with no payments
    nopay = plans_without_payments()
    lines.append('## 2. Fee Plans with No Payments')
    lines.append(f"Count: {nopay.count()}")
    if nopay:
        lines.append('| ID | Title | Amount | Due Date |')
        lines.append('| -- | ----- | ------ | -------- |')
        for p in nopay:
            lines.append(f"| {p.id} | {p.title} | {fmt_currency(p.amount)} | {p.due_date} |")
    lines.append('')

    # 3 Payments exceeding plan amount
    exceed = payments_exceeding_plan()
    lines.append('## 3. Payments Exceeding Their Fee Plan Amount')
    lines.append(f"Count: {exceed.count()}")
    if exceed:
        lines.append('| ID | Student | FeePlan | Paid Amount | Plan Amount |')
        lines.append('| -- | ------- | ------- | ----------- | ----------- |')
        for pay in exceed:
            lines.append(
                f"| {pay.id} | {pay.student_id} | {pay.fee_plan_id} | {fmt_currency(pay.amount)} | {fmt_currency(pay.fee_plan.amount)} |"
            )
    lines.append('')

    # 4 Paid payments missing transaction ID
    missing_tx = paid_missing_txid()
    lines.append('## 4. Paid Payments Missing Transaction ID')
    lines.append(f"Count: {missing_tx.count()}")
    if missing_tx:
        lines.append('| ID | Student | Amount |')
        lines.append('| -- | ------- | ------ |')
        for pay in missing_tx:
            lines.append(f"| {pay.id} | {pay.student_id} | {fmt_currency(pay.amount)} |")
    lines.append('')

    # 5 Potential duplicate payments
    dup_groups = duplicate_payments()
    total_dups = sum(g['cnt'] for g in dup_groups)
    lines.append('## 5. Potential Duplicate Payments')
    lines.append(f"Distinct duplicate groups: {dup_groups.count()}, total duplicate records: {total_dups}")
    if dup_groups:
        lines.append('| Student ID | FeePlan ID | Amount | Duplicate Count |')
        lines.append('| ---------- | ---------- | ------ | --------------- |')
        for g in dup_groups:
            lines.append(f"| {g['student_id']} | {g['fee_plan_id']} | {fmt_currency(g['amount'])} | {g['cnt']} |")
    lines.append('')

    report = "\n".join(lines)
    print(report)

    # Write to markdown file
    out_path = os.path.join(project_root, 'fee_verify_report.md')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"\nReport written to {out_path}")

if __name__ == '__main__':
    generate_report()
