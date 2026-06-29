# attendance_percentage.py
"""
Attendance Percentage Report
---------------------------
Generates a markdown report showing attendance percentages:
- Overall attendance across all classes
- Per‑class attendance percentage (present vs total records)
- Optionally per‑student attendance summary (commented out for brevity)
"""

import os
import sys
from datetime import date, timedelta

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
from django.db.models import Count, Q
from attendance.models import AttendanceSession, AttendanceRecord
from academics.models import ClassRoom

# ---------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------
def overall_attendance():
    """Return overall present count and total records."""
    totals = AttendanceRecord.objects.aggregate(
        total=Count('id'),
        present=Count('id', filter=Q(status=AttendanceRecord.Status.PRESENT))
    )
    return totals['present'] or 0, totals['total'] or 0

def class_attendance():
    """Return a dict mapping class id to (present, total) counts."""
    qs = AttendanceRecord.objects.values('session__classroom__id', 'session__classroom__name')
    qs = qs.annotate(
        total=Count('id'),
        present=Count('id', filter=Q(status=AttendanceRecord.Status.PRESENT))
    )
    result = {}
    for entry in qs:
        class_id = entry['session__classroom__id']
        class_name = entry['session__classroom__name']
        result[class_id] = {
            'name': class_name,
            'present': entry['present'] or 0,
            'total': entry['total'] or 0,
        }
    return result

# ---------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------
def generate_report():
    lines = ["# Attendance Percentage Report", ""]

    # Overall
    present, total = overall_attendance()
    overall_pct = (present / total * 100) if total else 0
    lines.append("## Overall Attendance")
    lines.append(f"- Total records: {total}")
    lines.append(f"- Present records: {present}")
    lines.append(f"- Attendance rate: {overall_pct:.2f}%\n")

    # Per class
    lines.append("## Per‑Class Attendance")
    lines.append("| Class ID | Class Name | Present | Total | Attendance % |")
    lines.append("| -------- | ---------- | ------- | ----- | ------------- |")
    for cid, info in class_attendance().items():
        pct = (info['present'] / info['total'] * 100) if info['total'] else 0
        lines.append(
            f"| {cid} | {info['name']} | {info['present']} | {info['total']} | {pct:.2f}% |"
        )
    lines.append('')

    report = "\n".join(lines)
    print(report)

    out_path = os.path.join(project_root, 'attendance_percentage.md')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"\nReport written to {out_path}")

if __name__ == '__main__':
    generate_report()
