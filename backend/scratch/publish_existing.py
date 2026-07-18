import os, sys
sys.path.insert(0, '.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from learning.models import Note, VideoLecture

print("Publishing all notes and videos...")
notes_updated = Note.objects.filter(is_published=False).update(is_published=True)
videos_updated = VideoLecture.objects.filter(is_published=False).update(is_published=True)
print(f"Updated {notes_updated} notes and {videos_updated} videos.")
