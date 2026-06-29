# send_notification.py
"""
Notification Sender Script
--------------------------
Utility to send email notifications to selected user groups (students, teachers, or all).
Usage example:
    python backend/send_notification.py --subject "Important Update" \
        --message "Please read the latest announcement." --group all
"""

import os
import sys
import argparse
from django.core.mail import send_mail
from django.conf import settings

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
from users.models import User  # Assuming a generic User model

# ---------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------
def get_recipients(group: str):
    """Return a list of email addresses for the requested group.
    group can be 'students', 'teachers', or 'all'."""
    if group == 'students':
        return list(User.objects.filter(is_student=True).values_list('email', flat=True))
    if group == 'teachers':
        return list(User.objects.filter(is_teacher=True).values_list('email', flat=True))
    # default to all active users with an email
    return list(User.objects.filter(email__isnull=False).values_list('email', flat=True))

# ---------------------------------------------------------------
# Main execution
# ---------------------------------------------------------------
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Send email notifications to user groups.')
    parser.add_argument('--subject', required=True, help='Email subject line')
    parser.add_argument('--message', required=True, help='Plain‑text email body')
    parser.add_argument('--group', default='all', choices=['students', 'teachers', 'all'],
                        help='Recipient group')
    args = parser.parse_args()

    recipient_list = get_recipients(args.group)
    if not recipient_list:
        print('No recipients found for group:', args.group)
        sys.exit(1)

    # Use Django's send_mail (configured in settings)
    send_mail(
        subject=args.subject,
        message=args.message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipient_list,
        fail_silently=False,
    )
    print(f'Notification sent to {len(recipient_list)} {args.group} recipients.')
