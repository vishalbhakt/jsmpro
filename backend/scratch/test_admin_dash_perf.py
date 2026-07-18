import os
import sys
import django

# Setup Django Environment
sys.path.append("E:\\deploy\\jsm_production\\backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from django.db import connection
from dashboard.views import admin_overview

User = get_user_model()

print("Setting up test request...")
factory = RequestFactory()
request = factory.get('/dashboard/admin/')

# Fetch an admin user
admin_user = User.objects.filter(role='admin').first()
if not admin_user:
    # If no admin, find any user and temporarily set to admin
    admin_user = User.objects.first()
    admin_user.role = 'admin'
    admin_user.save()

request.user = admin_user

print("Enabling queries profiling...")
connection.force_debug_cursor = True

# Clear existing queries
connection.queries_log.clear()

print("Executing admin_overview view...")
response = admin_overview(request)

print(f"Response status code: {response.status_code}")
print(f"Total SQL queries executed: {len(connection.queries)}")

for i, query in enumerate(connection.queries, 1):
    print(f"\nQuery {i}:")
    print(query['sql'])
