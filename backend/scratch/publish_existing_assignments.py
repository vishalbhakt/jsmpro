import os, sys
sys.path.insert(0, '.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from learning.models import Assignment

print("Publishing all assignments with status='published'...")
updated = Assignment.objects.filter(status="published", is_published=False).update(is_published=True)
print(f"Updated {updated} assignments.")
