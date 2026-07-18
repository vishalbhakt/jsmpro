import os, sys
sys.path.insert(0, '.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from users.models import User, StudentProfile
from academics.models import ClassRoom, Subject
from learning.models import Note, VideoLecture

print("=== NOTES ===")
for n in Note.objects.all():
    print(f"ID: {n.id} | Title: {n.title} | Classroom: {n.classroom} | Subject: {n.subject} | Is Published: {n.is_published}")

print("\n=== VIDEOS ===")
for v in VideoLecture.objects.all():
    print(f"ID: {v.id} | Title: {v.title} | Classroom: {v.classroom} | Subject: {v.subject} | Is Published: {v.is_published}")

print("\n=== STUDENTS ===")
for sp in StudentProfile.objects.all():
    print(f"Student: {sp.user.username} | Classroom: {sp.classroom}")
