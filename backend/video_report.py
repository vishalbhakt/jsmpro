# video_report.py
"""
Script: video_report.py
Purpose: Generate a report of all VideoLecture entries that have a YouTube link in the `video_url` field.
Usage: Run this script from the project root after activating the virtual environment.
Example: `python backend/video_report.py`
The script prints a markdown table and writes `video_report.md` in the project root.
"""

import os
import sys

# Configure Django settings – the settings module lives in the `config` package
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from learning.models import VideoLecture

def is_youtube_url(url):
    """Return True if the URL points to YouTube (full or short form)."""
    if not url:
        return False
    return 'youtube.com' in url or 'youtu.be' in url

def generate_report():
    videos = VideoLecture.objects.all()
    youtube_videos = [v for v in videos if is_youtube_url(v.video_url)]
    if not youtube_videos:
        print('No YouTube links found in VideoLecture records.')
        return

    header = ['ID', 'Title', 'YouTube URL', 'Classroom', 'Subject', 'Teacher']
    rows = []
    for v in youtube_videos:
        rows.append([
            str(v.id),
            v.title,
            v.video_url,
            str(v.classroom_id),
            str(v.subject_id),
            str(v.teacher_id),
        ])

    # Compute column widths for nice alignment
    col_widths = [max(len(str(item)) for item in column) for column in zip(header, *rows)]
    def fmt_row(row):
        return '| ' + ' | '.join(f"{cell}{' ' * (col_widths[i] - len(str(cell)))}" for i, cell in enumerate(row)) + ' |'
    separator = '| ' + ' | '.join('-' * w for w in col_widths) + ' |'

    markdown_lines = [fmt_row(header), separator]
    for r in rows:
        markdown_lines.append(fmt_row(r))
    markdown_content = "\n".join(markdown_lines)
    print(markdown_content)

    # Write to a markdown file for persistence
    report_path = os.path.join(project_root, 'video_report.md')
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write('# VideoLecture YouTube Links Report\n\n')
        f.write(markdown_content)
        f.write('\n')
    print(f"\nReport written to {report_path}")

if __name__ == '__main__':
    generate_report()
