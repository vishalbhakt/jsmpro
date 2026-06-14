from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from academics.models import Assessment, ClassRoom, Result, Subject
from attendance.models import AttendanceRecord, AttendanceSession
from cms.models import ContactMessage, Course, Facility, GalleryItem, Inquiry, Page
from communication.models import ActivityLog, Announcement, Notification
from finance.models import FeePlan, Payment
from learning.models import Assignment, Note, Quiz, VideoLecture
from users.models import StudentProfile, TeacherProfile, User


class Command(BaseCommand):
    help = "Seed JSM Shiksha Academy with demo users and academic data."

    def handle(self, *args, **options):
        admin = self.upsert_user(
            username="admin",
            email="admin@jsmshiksha.local",
            password="Admin@12345",
            first_name="JSM",
            last_name="Admin",
            role=User.Roles.ADMIN,
            is_staff=True,
            is_superuser=True,
        )
        teacher_user = self.upsert_user(
            username="teacher",
            email="teacher@jsmshiksha.local",
            password="Teacher@12345",
            first_name="Asha",
            last_name="Verma",
            role=User.Roles.TEACHER,
            phone="9000000001",
        )
        student_user = self.upsert_user(
            username="student",
            email="student@jsmshiksha.local",
            password="Student@12345",
            first_name="Rohan",
            last_name="Kumar",
            role=User.Roles.STUDENT,
            phone="9000000002",
        )

        teacher, _ = TeacherProfile.objects.get_or_create(
            user=teacher_user,
            defaults={
                "employee_id": "TEA00001",
                "qualification": "M.Sc Mathematics",
                "designation": "Senior Teacher",
                "joined_on": date.today() - timedelta(days=730),
            },
        )

        classroom, _ = ClassRoom.objects.get_or_create(
            name="Class 10",
            section="A",
            academic_year="2026-27",
            defaults={"class_teacher": teacher, "capacity": 45},
        )
        subject, _ = Subject.objects.get_or_create(
            classroom=classroom,
            code="MATH10",
            defaults={"name": "Mathematics", "teacher": teacher, "description": "Algebra, geometry, and statistics."},
        )
        student, _ = StudentProfile.objects.get_or_create(
            user=student_user,
            defaults={
                "admission_number": "ADM00001",
                "roll_number": "10A-01",
                "classroom": classroom,
                "guardian_name": "Suresh Kumar",
                "guardian_phone": "9000000003",
            },
        )
        if student.classroom_id != classroom.id:
            student.classroom = classroom
            student.save(update_fields=["classroom"])

        assessment, _ = Assessment.objects.get_or_create(
            classroom=classroom,
            subject=subject,
            title="Unit Test 1",
            defaults={"assessment_type": Assessment.Type.TEST, "max_marks": 50, "created_by": teacher},
        )
        Result.objects.get_or_create(
            assessment=assessment,
            student=student,
            defaults={"marks_obtained": 43, "grade": "A", "published_at": timezone.now()},
        )

        session, _ = AttendanceSession.objects.get_or_create(
            classroom=classroom,
            subject=subject,
            date=date.today(),
            defaults={"taken_by": teacher},
        )
        AttendanceRecord.objects.get_or_create(session=session, student=student, defaults={"status": "present"})

        assignment, _ = Assignment.objects.get_or_create(
            classroom=classroom,
            subject=subject,
            title="Linear Equations Practice",
            defaults={
                "teacher": teacher,
                "description": "Solve the worksheet and upload your answers.",
                "due_at": timezone.now() + timedelta(days=7),
                "points": 20,
                "published_at": timezone.now(),
            },
        )
        Note.objects.get_or_create(
            classroom=classroom,
            subject=subject,
            title="Algebra Formula Sheet",
            defaults={
                "teacher": teacher,
                "description": "Important formulas for quick revision.",
                "file": "notes/algebra-formula-sheet.pdf",
                "published_at": timezone.now(),
            },
        )
        VideoLecture.objects.get_or_create(
            classroom=classroom,
            subject=subject,
            title="Introduction to Linear Equations",
            defaults={
                "teacher": teacher,
                "description": "Concept explanation and solved examples.",
                "video_url": "https://example.com/videos/linear-equations",
                "duration_minutes": 28,
                "published_at": timezone.now(),
            },
        )
        Quiz.objects.get_or_create(
            classroom=classroom,
            subject=subject,
            title="Algebra Quick Quiz",
            defaults={
                "teacher": teacher,
                "description": "Short formative assessment.",
                "instructions": "Answer all questions.",
                "total_questions": 10,
                "max_marks": 10,
                "published_at": timezone.now(),
            },
        )

        fee_plan, _ = FeePlan.objects.get_or_create(
            classroom=classroom,
            title="Term 1 Tuition Fee",
            defaults={"amount": 12500, "due_date": date.today() + timedelta(days=30)},
        )
        Payment.objects.get_or_create(
            student=student,
            fee_plan=fee_plan,
            defaults={"amount": fee_plan.amount, "status": Payment.Status.PENDING, "method": Payment.Method.ONLINE},
        )

        Announcement.objects.get_or_create(
            title="Admission Open for 2026-27",
            defaults={
                "body": "Admissions are open for the new academic session.",
                "audience": Announcement.Audience.ALL,
                "created_by": admin,
                "pinned": True,
                "published_at": timezone.now(),
            },
        )
        Notification.objects.get_or_create(
            recipient=student_user,
            title="Assignment Published",
            defaults={"message": assignment.title, "category": Notification.Category.ACADEMIC},
        )
        ActivityLog.objects.get_or_create(
            actor=admin,
            action="Seeded demo data",
            defaults={"metadata": {"source": "seed_demo"}},
        )

        Page.objects.get_or_create(
            slug="about",
            defaults={
                "title": "About JSM Shiksha Academy",
                "body": "JSM Shiksha Academy delivers structured classroom learning with digital support.",
            },
        )
        Course.objects.get_or_create(
            slug="secondary-foundation",
            defaults={
                "title": "Secondary Foundation",
                "description": "Focused academic support for classes 9 and 10.",
                "grade_range": "Class 9-10",
                "is_featured": True,
            },
        )
        Facility.objects.get_or_create(
            title="Smart Classrooms",
            defaults={"description": "Digitally enabled classrooms for interactive learning.", "icon": "Monitor"},
        )
        GalleryItem.objects.get_or_create(
            title="Classroom Session",
            defaults={"image": "gallery/classroom-session.jpg", "caption": "Interactive mathematics class."},
        )
        Inquiry.objects.get_or_create(
            email="parent@example.com",
            phone="9000000004",
            defaults={
                "student_name": "Priya Sharma",
                "guardian_name": "Neha Sharma",
                "preferred_class": "Class 9",
                "message": "Please share admission details.",
            },
        )
        ContactMessage.objects.get_or_create(
            email="visitor@example.com",
            subject="Portal access support",
            defaults={
                "name": "Kiran Mehta",
                "phone": "9000000005",
                "message": "Please help with portal access details for the new term.",
            },
        )

        if options.get("verbosity", 1) > 0:
            self.stdout.write(self.style.SUCCESS("Seeded demo data."))
            self.stdout.write("Admin: admin / Admin@12345")
            self.stdout.write("Teacher: teacher / Teacher@12345")
            self.stdout.write("Student: student / Student@12345")

    def upsert_user(self, username, email, password, **defaults):
        user, _ = User.objects.get_or_create(username=username, defaults={"email": email, **defaults})
        for key, value in {"email": email, **defaults}.items():
            setattr(user, key, value)
        user.set_password(password)
        user.save()
        return user
