import os, sys
sys.path.insert(0, '.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from learning.models import Assignment, AssignmentSubmission
from users.models import StudentProfile

print("=== ASSIGNMENTS ===")
for a in Assignment.objects.all():
    print(f"ID: {a.id} | Title: {a.title} | Classroom: {a.classroom} | Is Published: {a.is_published} | Status: {a.status}")

print("\n=== SUBMISSIONS ===")
for s in AssignmentSubmission.objects.all():
    print(f"ID: {s.id} | Assignment: {s.assignment.title} | Student: {s.student.user.username} | Status: {s.status}")
