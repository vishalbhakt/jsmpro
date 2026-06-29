# create_payment.py
"""
Create Payment Script
--------------------
Utility script to create a new `Payment` record and link it to a
`FeePlan` (which is already associated with a `ClassRoom`).

Usage (run from the project root):
    python backend/create_payment.py \
        --student-id <STUDENT_ID> \
        --fee-plan-id <FEE_PLAN_ID> \
        --amount <AMOUNT> \
        [--method cash|upi|card|bank_transfer|online] \
        [--status paid|pending|failed|refunded] \
        [--transaction-id <TX_ID>]

The script prints a short confirmation and also writes a markdown
receipt (`payment_receipt.md`) to the project root.
"""

import argparse
import os
import sys
from decimal import Decimal

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
from finance.models import Payment, FeePlan
from users.models import StudentProfile  # Assuming this exists

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def fmt_currency(val):
    return f"${val:,.2f}" if val is not None else "-"

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Create a Payment linked to a FeePlan (and thus to a ClassRoom)")
    parser.add_argument('--student-id', type=int, required=True, help='ID of the StudentProfile')
    parser.add_argument('--fee-plan-id', type=int, required=True, help='ID of the FeePlan')
    parser.add_argument('--amount', type=Decimal, required=True, help='Payment amount')
    parser.add_argument('--method', type=str, default='online', choices=['cash', 'upi', 'card', 'bank_transfer', 'online'], help='Payment method')
    parser.add_argument('--status', type=str, default='paid', choices=['pending', 'paid', 'failed', 'refunded'], help='Payment status')
    parser.add_argument('--transaction-id', type=str, default='', help='Optional transaction reference')
    args = parser.parse_args()

    # Validate related objects
    try:
        student = StudentProfile.objects.get(pk=args.student_id)
    except StudentProfile.DoesNotExist:
        print(f"StudentProfile with id {args.student_id} does not exist.")
        sys.exit(1)

    try:
        fee_plan = FeePlan.objects.get(pk=args.fee_plan_id)
    except FeePlan.DoesNotExist:
        print(f"FeePlan with id {args.fee_plan_id} does not exist.")
        sys.exit(1)

    # Create payment
    payment = Payment.objects.create(
        student=student,
        fee_plan=fee_plan,
        amount=args.amount,
        method=args.method,
        status=args.status,
        transaction_id=args.transaction_id,
        paid_at=None if args.status != 'paid' else django.utils.timezone.now(),
    )

    # Build a small markdown receipt
    receipt_lines = ["# Payment Receipt", ""]
    receipt_lines.append(f"- **Payment ID:** {payment.id}")
    receipt_lines.append(f"- **Student:** {student.id} ({student})")
    receipt_lines.append(f"- **ClassRoom:** {fee_plan.classroom_id}")
    receipt_lines.append(f"- **Amount:** {fmt_currency(payment.amount)}")
    receipt_lines.append(f"- **Method:** {payment.method}")
    receipt_lines.append(f"- **Status:** {payment.status}")
    if payment.transaction_id:
        receipt_lines.append(f"- **Transaction ID:** {payment.transaction_id}")
    receipt_content = "\n".join(receipt_lines)
    print(receipt_content)

    receipt_path = os.path.join(project_root, 'payment_receipt.md')
    with open(receipt_path, 'w', encoding='utf-8') as f:
        f.write(receipt_content)
    print(f"\nReceipt written to {receipt_path}")

if __name__ == '__main__':
    main()
