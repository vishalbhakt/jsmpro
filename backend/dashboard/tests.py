from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from users.models import User, StudentProfile, TeacherProfile
from academics.models import ClassRoom, Subject
from finance.models import FeePlan, Payment, StudentFee
from attendance.models import AttendanceSession, AttendanceRecord
import datetime
from decimal import Decimal

class AdminDashboardTests(TestCase):
    def setUp(self):
        # Create admin user for authentication
        self.admin_user = User.objects.create_user(
            username="admin_test",
            email="admin@test.com",
            password="password123",
            role="admin"
        )
        
        # Create general setup
        self.classroom = ClassRoom.objects.create(name="Class 10")
        self.subject = Subject.objects.create(name="Mathematics", classroom=self.classroom)
        
        self.fee_plan = FeePlan.objects.create(
            classroom=self.classroom,
            title="Academic Fee Plan",
            admission_fee=Decimal("10000.00"),
            tuition_fee=Decimal("30000.00"),
            exam_fee=Decimal("5000.00"),
            computer_fee=Decimal("1000.00"),
            library_fee=Decimal("1000.00"),
            sports_fee=Decimal("2000.00"),
            transport_fee=Decimal("0.00"),
            misc_fee=Decimal("1000.00"),
            discount=Decimal("0.00"),
            scholarship=Decimal("0.00"),
            is_active=True
        )
        # Note: FeePlan.save() automatically calculates amount sum = 50000.00

    def test_real_time_financial_aggregations(self):
        # Setup: 2 active student profiles (auto-created by signals)
        u1 = User.objects.create_user(username="student1", email="s1@test.com", password="pwd", role="student")
        u2 = User.objects.create_user(username="student2", email="s2@test.com", password="pwd", role="student")
        
        s1 = u1.student_profile
        s1.classroom = self.classroom
        s1.admission_number = "ADM001"
        s1.save()
        
        s2 = u2.student_profile
        s2.classroom = self.classroom
        s2.admission_number = "ADM002"
        s2.save()
        
        # Link to fee plans
        sf1 = StudentFee.objects.create(student=s1, fee_plan=self.fee_plan, academic_year="2026-27")
        sf2 = StudentFee.objects.create(student=s2, fee_plan=self.fee_plan, academic_year="2026-27")
        
        self.client.force_login(self.admin_user)
        
        # Action 1: Load dashboard, initial state
        response = self.client.get(reverse('admin_overview'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Decimal(response.context['total_revenue']), Decimal("0.00"))
        self.assertEqual(Decimal(response.context['pending_fees']), Decimal("100000.00"))
        
        # Action 2: Payment Trigger (Create a successful payment for student 1)
        Payment.objects.create(
            student=s1,
            fee_plan=self.fee_plan,
            student_fee=sf1,
            amount=Decimal("20000.00"),
            status='paid',
            academic_session="2026-27"
        )
        
        # Assertion: Reload dashboard and assert
        response = self.client.get(reverse('admin_overview'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Decimal(response.context['total_revenue']), Decimal("20000.00"))
        self.assertEqual(Decimal(response.context['pending_fees']), Decimal("80000.00"))

    def test_real_time_attendance_percentage_calculation(self):
        # Setup: Create 4 active students (auto-created by signals)
        students = []
        for i in range(4):
            u = User.objects.create_user(username=f"student_att{i}", email=f"sa{i}@test.com", password="pwd", role="student")
            s = u.student_profile
            s.classroom = self.classroom
            s.admission_number = f"ADM_ATT{i}"
            s.save()
            students.append(s)
            
        self.client.force_login(self.admin_user)
        
        # Edge Case: 0 attendance marked today -> Should return 'Not Marked'
        response = self.client.get(reverse('admin_overview'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['today_attendance_pct'], 'Not Marked')
        
        # Action: Create session for today and mark exactly 1 student as present
        today = timezone.now().date()
        session = AttendanceSession.objects.create(
            classroom=self.classroom,
            subject=self.subject,
            date=today
        )
        
        AttendanceRecord.objects.create(
            session=session,
            student=students[0],
            status='present'
        )
        # Mark other 3 as absent
        for s in students[1:]:
            AttendanceRecord.objects.create(
                session=session,
                student=s,
                status='absent'
            )
            
        # Assertion: Load dashboard and check
        response = self.client.get(reverse('admin_overview'))
        self.assertEqual(response.status_code, 200)
        # 1 present out of 4 active = 25.0%
        self.assertEqual(float(response.context['today_attendance_pct']), 25.0)

    def test_dynamic_feeds_and_ordering(self):
        # Setup student for payments
        u = User.objects.create_user(username="student_feed", email="sf@test.com", password="pwd", role="student")
        u.date_joined = timezone.now() - datetime.timedelta(days=10)
        u.save()
        
        s = u.student_profile
        s.classroom = self.classroom
        s.save()
        
        # Create 6 payment transactions with different timestamps (using save with force-updated auto_now fields)
        payments = []
        for i in range(6):
            p = Payment.objects.create(
                student=s,
                amount=Decimal("1000.00") + i,
                status='paid',
                academic_session="2026-27"
            )
            # Override created_at to control ordering explicitly
            p.created_at = timezone.now() - datetime.timedelta(hours=6 - i)
            p.save()
            payments.append(p)
            
        # Create 5 users to check recently enrolled (4 students + 1 teacher)
        users = []
        for i in range(5):
            role = "student" if i < 4 else "teacher"
            u_enrolled = User.objects.create_user(
                username=f"enrolled_user{i}",
                email=f"eu{i}@test.com",
                password="pwd",
                role=role
            )
            u_enrolled.date_joined = timezone.now() - datetime.timedelta(days=5 - i)
            u_enrolled.save()
            users.append(u_enrolled)
            
        self.client.force_login(self.admin_user)
        response = self.client.get(reverse('admin_overview'))
        self.assertEqual(response.status_code, 200)
        
        # Verify Recent Payments: exactly 5, ordered by latest first
        recent_p = list(response.context['recent_payments'])
        self.assertEqual(len(recent_p), 5)
        # Payments[5] (amount 1005) is the latest created, payments[1] is the oldest in the top 5
        self.assertEqual(recent_p[0].id, payments[5].id)
        self.assertEqual(recent_p[4].id, payments[1].id)
        
        # Verify Recently Enrolled: top 4 latest created students/teachers (excluding admins)
        recent_u = list(response.context['recent_users'])
        self.assertEqual(len(recent_u), 4)
        # Users[4] is the latest joined
        self.assertEqual(recent_u[0].id, users[4].id)
        self.assertEqual(recent_u[3].id, users[1].id)

    def test_query_performance_verification(self):
        # Set up a few records to run real query counts
        u = User.objects.create_user(username="student_perf", email="sperf@test.com", password="pwd", role="student")
        s = u.student_profile
        s.classroom = self.classroom
        s.save()
        sf = StudentFee.objects.create(student=s, fee_plan=self.fee_plan, academic_year="2026-27")
        
        self.client.force_login(self.admin_user)
        
        # Let's run a check with assertNumQueries. Since Django TestCase runs setup queries on first hit,
        # we do a warm-up hit first, then measure query count for rendering to be 100% precise.
        self.client.get(reverse('admin_overview'))
        
        # rendering the view should use <= 16 queries (which matches our profiling of 16 queries total)
        with self.assertNumQueries(16):
            response = self.client.get(reverse('admin_overview'))
            self.assertEqual(response.status_code, 200)
