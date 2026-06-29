import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction

from academics.models import Assessment, ClassRoom, Result, Subject
from attendance.models import AttendanceRecord, AttendanceSession
from cms.models import ContactMessage, Course, Facility, GalleryItem, Inquiry, Page
from communication.models import ActivityLog, Announcement, Notification
from finance.models import FeePlan, Payment
from learning.models import Assignment, AssignmentSubmission, Note, Quiz, VideoLecture
from users.models import StudentProfile, TeacherProfile, User


class Command(BaseCommand):
    help = "Seed database with exactly 10 students per grade (K to Grade 8), 10 CMS courses, and subjects mapped to teachers."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Starting production-ready database seeding...")

        # 1. Clear existing JSM data to ensure clean numbers (except superusers if needed, but atomic overwrite is safe)
        self.stdout.write("Preparing database environment...")
        User.objects.filter(is_superuser=False).delete()
        ClassRoom.objects.all().delete()
        Course.objects.all().delete()
        Facility.objects.all().delete()
        GalleryItem.objects.all().delete()

        # 2. Seed Admin
        admin = self.upsert_user(
            username="admin_office",
            email="office@jsmshiksha.edu.in",
            password="SecureAdmin#2026",
            first_name="JSM",
            last_name="Administration",
            role=User.Roles.ADMIN,
            is_staff=True,
            is_superuser=True,
        )

        # 3. Seed 7 Teachers
        teachers_data = [
            {"username": "asha_maths", "email": "asha.verma@jsmshiksha.edu.in", "first_name": "Asha", "last_name": "Verma", "qualification": "M.Sc. Mathematics, B.Ed.", "designation": "Head of Mathematics"},
            {"username": "vikram_science", "email": "vikram.seth@jsmshiksha.edu.in", "first_name": "Vikram", "last_name": "Seth", "qualification": "Ph.D. in Physics, M.Ed.", "designation": "Senior Science Teacher"},
            {"username": "sarah_english", "email": "sarah.jones@jsmshiksha.edu.in", "first_name": "Sarah", "last_name": "Jones", "qualification": "M.A. English Literature", "designation": "English Coordinator"},
            {"username": "rajesh_history", "email": "rajesh.kumar@jsmshiksha.edu.in", "first_name": "Rajesh", "last_name": "Kumar", "qualification": "M.A. History, B.Ed.", "designation": "Social Studies Instructor"},
            {"username": "michael_pe", "email": "michael.j@jsmshiksha.edu.in", "first_name": "Michael", "last_name": "Johnson", "qualification": "B.P.Ed. Physical Education", "designation": "Sports Director"},
            {"username": "emily_art", "email": "emily.d@jsmshiksha.edu.in", "first_name": "Emily", "last_name": "Davis", "qualification": "B.F.A. Fine Arts", "designation": "Creative Arts Specialist"},
            {"username": "sanjay_cs", "email": "sanjay.g@jsmshiksha.edu.in", "first_name": "Sanjay", "last_name": "Gupta", "qualification": "M.Tech Computer Science", "designation": "IT Instructor"},
        ]

        teachers = []
        for index, t in enumerate(teachers_data):
            user = self.upsert_user(
                username=t["username"],
                email=t["email"],
                password="TeacherPass#2026",
                first_name=t["first_name"],
                last_name=t["last_name"],
                role=User.Roles.TEACHER,
                phone=f"987654321{index}",
            )
            profile, _ = TeacherProfile.objects.get_or_create(
                user=user,
                defaults={
                    "employee_id": f"EMP{202600 + index:04d}",
                    "qualification": t["qualification"],
                    "designation": t["designation"],
                    "joined_on": date.today() - timedelta(days=365 * 2),
                },
            )
            teachers.append(profile)

        # 4. Seed 9 ClassRooms (Kindergarten to Grade 8)
        class_names = [
            "Kindergarten", "Grade 1", "Grade 2", "Grade 3", 
            "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8"
        ]

        classrooms = []
        for idx, name in enumerate(class_names):
            classroom, _ = ClassRoom.objects.get_or_create(
                name=name,
                section="A",
                academic_year="2026-27",
                defaults={
                    "class_teacher": teachers[idx % len(teachers)],
                    "capacity": 30,
                },
            )
            classrooms.append(classroom)

        # 5. Seed Subjects for every Classroom (using academic structure)
        subjects = []
        for cr in classrooms:
            # Determine subjects based on grade level
            if cr.name == "Kindergarten":
                subject_plans = [
                    {"name": "Early Numeracy", "code": "NUM-K", "teacher": teachers[0]},
                    {"name": "Early Literacy", "code": "LIT-K", "teacher": teachers[2]},
                    {"name": "Creative Arts", "code": "ART-K", "teacher": teachers[5]},
                ]
            elif cr.name in ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"]:
                g_num = cr.name.split()[-1]
                subject_plans = [
                    {"name": f"Mathematics Grade {g_num}", "code": f"MATH-0{g_num}", "teacher": teachers[0]},
                    {"name": f"General Science Grade {g_num}", "code": f"SCI-0{g_num}", "teacher": teachers[1]},
                    {"name": f"English Grammar Grade {g_num}", "code": f"ENG-0{g_num}", "teacher": teachers[2]},
                    {"name": f"Social Studies Grade {g_num}", "code": f"SOC-0{g_num}", "teacher": teachers[3]},
                    {"name": f"Physical Education Grade {g_num}", "code": f"PE-0{g_num}", "teacher": teachers[4]},
                ]
            else:  # Middle School: Grade 6, 7, 8
                g_num = cr.name.split()[-1]
                subject_plans = [
                    {"name": f"Advanced Mathematics Grade {g_num}", "code": f"MATH-0{g_num}", "teacher": teachers[0]},
                    {"name": f"Integrated Sciences Grade {g_num}", "code": f"SCI-0{g_num}", "teacher": teachers[1]},
                    {"name": f"English Literature Grade {g_num}", "code": f"ENG-0{g_num}", "teacher": teachers[2]},
                    {"name": f"History & Civics Grade {g_num}", "code": f"SOC-0{g_num}", "teacher": teachers[3]},
                    {"name": f"Computer Applications Grade {g_num}", "code": f"COMP-0{g_num}", "teacher": teachers[6]},
                ]

            for sp in subject_plans:
                subject, _ = Subject.objects.get_or_create(
                    classroom=cr,
                    code=sp["code"],
                    defaults={
                        "name": sp["name"],
                        "teacher": sp["teacher"],
                        "description": f"Academic instruction module for {sp['name']}.",
                    },
                )
                subjects.append(subject)

        # 6. Seed exactly 10 Students for each ClassRoom (total 90 students)
        self.stdout.write("Seeding exactly 10 students for each grade level...")
        first_names = [
            "Aarav", "Ananya", "Vihaan", "Aditi", "Sai", "Pranav", "Riya", "Vivaan", "Ishaan", "Diya",
            "Kabir", "Meera", "Arjun", "Sneha", "Aditya", "Rohan", "Pooja", "Vikram", "Shreya", "Nikhil",
            "Karan", "Tanvi", "Siddharth", "Kriti", "Rahul", "Neha", "Varun", "Priya", "Manish", "Anjali",
            "Yash", "Richa", "Kunwar", "Payal", "Harsh", "Gauri", "Dev", "Alka", "Samrat", "Kavya",
            "Rishi", "Megha", "Madhav", "Komal", "Gaurav", "Nisha", "Sameer", "Simran", "Aakash", "Preeti",
            "Jay", "Priyanka", "Vivek", "Rashmi", "Abhishek", "Ritu", "Deepak", "Rani", "Sanjay", "Poonam",
            "Raj", "Jyoti", "Sunil", "Kusum", "Vijay", "Lata", "Anil", "Asha", "Ravi", "Geeta",
            "Alok", "Babita", "Hemant", "Sarla", "Dinesh", "Usha", "Manoj", "Kiran", "Pramod", "Sudha",
            "Santosh", "Manju", "Satish", "Pushpa", "Naresh", "Sheela", "Surendra", "Sunita", "Jitendra", "Sharda"
        ]
        last_names = [
            "Sharma", "Patel", "Kumar", "Singh", "Reddy", "Nair", "Kapoor", "Rao", "Joshi", "Sen",
            "Gupta", "Roy", "Choudhury", "Bose", "Mishra", "Das", "Mehta", "Vani", "Sethi", "Pillai"
        ]

        students = []
        student_idx = 0
        for cr in classrooms:
            for s_num in range(1, 11):  # exactly 10 per class
                first = first_names[student_idx]
                last = last_names[student_idx % len(last_names)]
                username = f"{first.lower()}_{last.lower()}_{student_idx}"
                email = f"{username}@jsmshiksha.edu.in"
                
                user = self.upsert_user(
                    username=username,
                    email=email,
                    password="StudentPass#2026",
                    first_name=first,
                    last_name=last,
                    role=User.Roles.STUDENT,
                    phone=f"9900000{student_idx:03d}",
                )

                profile, _ = StudentProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        "admission_number": f"ADM2026{student_idx:04d}",
                        "roll_number": f"{cr.name.replace(' ', '')}-{s_num:02d}",
                        "classroom": cr,
                        "guardian_name": f"Guardian of {first}",
                        "guardian_phone": f"9900001{student_idx:03d}",
                        "blood_group": random.choice(["O+", "A+", "B+", "AB+"]),
                    },
                )
                students.append(profile)
                student_idx += 1

        # 7. Seed 10 CMS Courses with complete details
        self.stdout.write("Creating 10 CMS courses with complete descriptions...")
        courses_data = [
            {"title": "Early Years Numeracy Pathway", "slug": "early-years-numeracy", "desc": "Introduction to numbers, shapes, and structural spatial logic for early childhood.", "range": "Kindergarten"},
            {"title": "Early Years Literacy Pathway", "slug": "early-years-literacy", "desc": "Phonics, letter shapes, basic sight reading, and storytelling programs.", "range": "Kindergarten"},
            {"title": "Primary Arithmetic Foundations", "slug": "primary-arithmetic", "desc": "Covers addition, subtraction, division, and basic fractions for elementary students.", "range": "Grade 1-3"},
            {"title": "Elementary Science Inquiry", "slug": "elementary-science-inquiry", "desc": "Introduction to biology, earth science, and light physics using guided lab experiments.", "range": "Grade 1-5"},
            {"title": "English Grammar & Writing Core", "slug": "english-grammar-writing", "desc": "Writing paragraphs, vocabulary acquisition, and correct grammar syntax structures.", "range": "Grade 1-5"},
            {"title": "Elementary Social Studies & Heritage", "slug": "elementary-social-studies", "desc": "Introduction to local historical facts, geography mapping, and civic roles.", "range": "Grade 1-5"},
            {"title": "Advanced Middle School Algebra", "slug": "middle-school-algebra", "desc": "Fractions, linear equations, coordinate geometry, and statistical analysis projects.", "range": "Grade 6-8"},
            {"title": "Integrated Physics & Chemistry Lab", "slug": "integrated-physics-chemistry", "desc": "Foundational physics forces, atomic systems, and laboratory experiment reports.", "range": "Grade 6-8"},
            {"title": "Middle School English Lit & Analysis", "slug": "english-literature-analysis", "desc": "Reading prose, writing structured essays, and studying classic literature texts.", "range": "Grade 6-8"},
            {"title": "Computer Programming Foundations", "slug": "computer-programming-foundations", "desc": "Introduction to coding logic, algorithms, loops, and basic Python commands.", "range": "Grade 6-8"},
        ]

        for idx, cd in enumerate(courses_data):
            Course.objects.get_or_create(
                slug=cd["slug"],
                defaults={
                    "title": cd["title"],
                    "description": cd["desc"],
                    "grade_range": cd["range"],
                    "is_featured": idx < 4,
                    "is_published": True,
                },
            )

        # 8. Seed Attendance registers (Last 3 school days)
        self.stdout.write("Logging historical attendance records...")
        day_list = []
        chk_date = date.today() - timedelta(days=5)
        while len(day_list) < 3:
            if chk_date.weekday() < 5:  # Mon-Fri
                day_list.append(chk_date)
            chk_date += timedelta(days=1)

        for day in day_list:
            for sub in subjects:
                session, _ = AttendanceSession.objects.get_or_create(
                    classroom=sub.classroom,
                    subject=sub,
                    date=day,
                    defaults={"taken_by": sub.teacher},
                )
                class_students = [s for s in students if s.classroom == sub.classroom]
                for student in class_students:
                    status = "present" if random.random() > 0.08 else "absent"
                    AttendanceRecord.objects.get_or_create(
                        session=session,
                        student=student,
                        defaults={"status": status},
                    )

        # 9. Seed Assessments & Results
        self.stdout.write("Recording assessment scores...")
        for sub in subjects:
            assessment, _ = Assessment.objects.get_or_create(
                classroom=sub.classroom,
                subject=sub,
                title="Class Quiz 1",
                defaults={
                    "assessment_type": Assessment.Type.QUIZ,
                    "max_marks": 20,
                    "created_by": sub.teacher,
                },
            )
            class_students = [s for s in students if s.classroom == sub.classroom]
            for student in class_students:
                marks = random.randint(12, 20)
                grade = "A" if marks >= 18 else ("B" if marks >= 15 else "C")
                Result.objects.get_or_create(
                    assessment=assessment,
                    student=student,
                    defaults={
                        "marks_obtained": marks,
                        "grade": grade,
                        "published_at": timezone.now() - timedelta(days=2),
                    },
                )

        # 10. Seed Billing Ledger plans
        self.stdout.write("Populating financial ledgers...")
        fee_plans = []
        for cr in classrooms:
            plan, _ = FeePlan.objects.get_or_create(
                classroom=cr,
                title="First Term Tuition Charges",
                defaults={
                    "amount": 15000,
                    "due_date": date.today() + timedelta(days=20),
                },
            )
            fee_plans.append(plan)

        for student in students:
            matching_plan = next(fp for fp in fee_plans if fp.classroom == student.classroom)
            is_paid = random.random() > 0.30
            status = Payment.Status.PAID if is_paid else Payment.Status.PENDING
            paid_time = timezone.now() - timedelta(days=5) if is_paid else None
            tx_id = f"TXN{random.randint(1000000, 9999999)}" if is_paid else ""

            Payment.objects.get_or_create(
                student=student,
                fee_plan=matching_plan,
                defaults={
                    "amount": matching_plan.amount,
                    "status": status,
                    "method": Payment.Method.ONLINE if is_paid else Payment.Method.CASH,
                    "paid_at": paid_time,
                    "transaction_id": tx_id,
                },
            )

        # 11. Public Assets CMS
        Facility.objects.get_or_create(
            title="Elementary Science Lab",
            defaults={"description": "Interactive laboratory with models and measurement scopes.", "icon": "Flask"},
        )
        GalleryItem.objects.get_or_create(
            title="Kindergarten Literacy Session",
            defaults={"image": "gallery/k-literacy.jpg", "caption": "Students learning phonics charts."},
        )

        ActivityLog.objects.get_or_create(
            actor=admin,
            action="Completed seeding 10 students per class and 10 CMS courses",
            defaults={"metadata": {"status": "success"}},
        )

        self.stdout.write(self.style.SUCCESS("Database fully seeded with all academic specifications!"))
        self.stdout.write("Total ClassRooms created: 9 (K to Grade 8)")
        self.stdout.write("Total Students created: 90 (exactly 10 per classroom)")
        self.stdout.write("Total CMS Courses created: 10")
        self.stdout.write("Login details:")
        self.stdout.write("- Admin: admin_office / SecureAdmin#2026")
        self.stdout.write("- Teacher: asha_maths / TeacherPass#2026")
        self.stdout.write("- Student: aarav_sharma_0 / StudentPass#2026")

    def upsert_user(self, username, email, password, **defaults):
        user, _ = User.objects.get_or_create(username=username, defaults={"email": email, **defaults})
        for key, value in {"email": email, **defaults}.items():
            setattr(user, key, value)
        user.set_password(password)
        user.save()
        return user
