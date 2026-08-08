from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from users.models import User, StudentProfile, TeacherProfile
from academics.models import ClassRoom, Subject, Assessment, Result, ExamResult
from finance.models import FeePlan, Payment, StudentFee
from attendance.models import AttendanceSession, AttendanceRecord, LeaveApplication
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

    def test_admin_user_create_student_with_classroom(self):
        self.client.force_login(self.admin_user)
        
        # Action: Create student user using POST
        post_data = {
            "first_name": "Test",
            "last_name": "Student",
            "username": "test_student_user",
            "email": "test_student@jsm.com",
            "role": "student",
            "password1": "SecurePass123",
            "password2": "SecurePass123",
            "classroom": self.classroom.id,
            "is_active": "on"
        }
        
        response = self.client.post(reverse("admin_user_create"), post_data)
        self.assertEqual(response.status_code, 302)  # Redirects on success
        
        # Verify user was created with hashed password
        user = User.objects.get(username="test_student_user")
        self.assertTrue(user.check_password("SecurePass123"))
        self.assertTrue(user.is_active)
        self.assertEqual(user.role, "student")
        
        # Verify student profile was automatically created and linked to the classroom
        self.assertTrue(hasattr(user, "student_profile"))
        self.assertEqual(user.student_profile.classroom, self.classroom)
        self.assertEqual(user.student_profile.admission_number, f"ADM{user.id:05d}")

    def test_dual_authentication_backends(self):
        # Create user
        user = User.objects.create_user(
            username="JohnDoe",
            email="johndoe@jsm.com",
            password="secretpassword",
            role="student"
        )
        
        # Test case-insensitive username login
        from django.contrib.auth import authenticate
        user_auth = authenticate(username="johndoe", password="secretpassword")
        self.assertIsNotNone(user_auth)
        self.assertEqual(user_auth, user)
        
        # Test case-insensitive email login
        user_auth_email = authenticate(username="JOHNDOE@JSM.COM", password="secretpassword")
        self.assertIsNotNone(user_auth_email)
        self.assertEqual(user_auth_email, user)

    def test_admin_user_create_duplicate_username(self):
        self.client.force_login(self.admin_user)
        # Create an existing user
        User.objects.create_user(username="existing_user", email="ex@test.com", password="pwd", role="student")
        
        post_data = {
            "first_name": "Test",
            "last_name": "User",
            "username": "EXISTING_USER",  # Duplicate check is case-insensitive
            "email": "new@test.com",
            "role": "student",
            "password1": "SecurePass123",
            "password2": "SecurePass123"
        }
        
        response = self.client.post(reverse("admin_user_create"), post_data)
        self.assertEqual(response.status_code, 200)  # Re-renders page on validation failure
        
        # Verify the error message is present in the messages context
        messages = list(response.context['messages'])
        self.assertEqual(len(messages), 1)
        self.assertEqual(str(messages[0]), "⚠️ This Username is already taken! Please choose another.")

    def test_admin_user_create_duplicate_email(self):
        self.client.force_login(self.admin_user)
        # Create an existing user
        User.objects.create_user(username="user1", email="registered@test.com", password="pwd", role="student")
        
        post_data = {
            "first_name": "Test",
            "last_name": "User",
            "username": "new_user",
            "email": "REGISTERED@TEST.COM",  # Duplicate check is case-insensitive
            "role": "student",
            "password1": "SecurePass123",
            "password2": "SecurePass123"
        }
        
        response = self.client.post(reverse("admin_user_create"), post_data)
        self.assertEqual(response.status_code, 200)  # Re-renders page
        
        messages = list(response.context['messages'])
        self.assertEqual(len(messages), 1)
        self.assertEqual(str(messages[0]), "⚠️ This Email Address is already registered!")

    def test_admin_user_create_password_mismatch(self):
        self.client.force_login(self.admin_user)
        
        post_data = {
            "first_name": "Test",
            "last_name": "User",
            "username": "new_user",
            "email": "new@test.com",
            "role": "student",
            "password1": "SecurePass123",
            "password2": "DifferentPass456"
        }
        
        response = self.client.post(reverse("admin_user_create"), post_data)
        self.assertEqual(response.status_code, 200)  # Re-renders page
        
        messages = list(response.context['messages'])
        self.assertEqual(len(messages), 1)
        self.assertEqual(str(messages[0]), "⚠️ Passwords do not match!")

    def test_student_payments_view_read_only(self):
        # Create student user
        student_user = User.objects.create_user(
            username="student_pay_test",
            email="sp@test.com",
            password="password123",
            role="student"
        )
        s = student_user.student_profile
        s.classroom = self.classroom
        s.admission_number = "ADM_PAY_001"
        s.save()
        
        # Bypass custom save() completion percentage check using update()
        StudentProfile.objects.filter(id=s.id).update(is_profile_complete=True)
        s.refresh_from_db()
        
        # Link to fee plans
        sf = StudentFee.objects.create(student=s, fee_plan=self.fee_plan, academic_year="2026-27")
        sf.refresh_from_db()
        self.assertEqual(sf.remaining_balance, Decimal("50000.00"))
        
        # Log in as student
        self.client.force_login(student_user)
        
        # Load the tuition fees page
        response = self.client.get(reverse("student_payments"))
        self.assertEqual(response.status_code, 200)
        
        # Verify read-only data is rendered correctly
        self.assertContains(response, "My Tuition Fees")
        self.assertContains(response, "Academic Fee Plan")
        self.assertContains(response, "₹50,000.00")
        
        # Verify that the Pay Due Fees button is completely absent
        self.assertNotContains(response, "Pay Due Fees Online")
        self.assertNotContains(response, "payNowModal")
        self.assertNotContains(response, "payNowModalLabel")

    def test_teacher_attendance_leave_application_preselection(self):
        # Create teacher user
        teacher_user = User.objects.create_user(
            username="teacher_att_test",
            email="ta@test.com",
            password="password123",
            role="teacher"
        )
        tp = teacher_user.teacher_profile
        self.classroom.class_teacher = tp
        self.classroom.save()
        self.subject.teacher = tp
        self.subject.save()
        
        # Bypass teacher completion guard middleware
        TeacherProfile.objects.filter(id=tp.id).update(is_profile_complete=True)
        tp.refresh_from_db()
        
        # Create student user
        student_user = User.objects.create_user(
            username="student_leave_test",
            email="sl@test.com",
            password="password123",
            role="student"
        )
        s = student_user.student_profile
        s.classroom = self.classroom
        s.admission_number = "ADM_LEAVE_01"
        s.save()
        
        # Create approved leave overlapping with today
        today = timezone.now().date()
        LeaveApplication.objects.create(
            student=s,
            start_date=today - datetime.timedelta(days=1),
            end_date=today + datetime.timedelta(days=1),
            leave_type="medical",
            reason="Recovering from fever",
            status="approved"
        )
        
        # Log in as teacher
        self.client.force_login(teacher_user)
        
        # Fetch roster page for today
        url = reverse("teacher_attendance") + f"?classroom={self.classroom.id}&subject={self.subject.id}&date={today.isoformat()}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        
        # Verify student.active_leave is populated
        students_context = response.context["students"]
        self.assertEqual(len(students_context), 1)
        self.assertIsNotNone(students_context[0].active_leave)
        self.assertEqual(students_context[0].active_leave.reason, "Recovering from fever")
        
        # Verify On Leave badge and radio button properties are rendered correctly in HTML
        self.assertContains(response, "On Leave (View Note)")
        self.assertContains(response, "Recovering from fever")
        
        # Verify absent radio button is checked
        self.assertContains(response, 'value="absent" checked')


class AssessmentManagerTests(TestCase):
    def setUp(self):
        # Create users
        self.admin_user = User.objects.create_user(
            username="admin_ass_test",
            email="admin_ass@test.com",
            password="password123",
            role="admin"
        )
        self.teacher_user = User.objects.create_user(
            username="teacher_ass_test",
            email="teacher_ass@test.com",
            password="password123",
            role="teacher"
        )
        self.student_user = User.objects.create_user(
            username="student_ass_test",
            email="student_ass@test.com",
            password="password123",
            role="student"
        )
        
        # Bypass teacher completion wizard
        self.tp = self.teacher_user.teacher_profile
        TeacherProfile.objects.filter(id=self.tp.id).update(is_profile_complete=True)
        self.tp.refresh_from_db()
        
        # Classroom & Subject
        self.classroom = ClassRoom.objects.create(name="Class 11")
        self.subject = Subject.objects.create(name="Physics", classroom=self.classroom, teacher=self.tp)
        
        # Associate student to classroom
        self.student = self.student_user.student_profile
        self.student.classroom = self.classroom
        self.student.roll_number = 42
        self.student.admission_number = "ADM1101"
        self.student.save()
        
        # Create Assessment
        self.assessment = Assessment.objects.create(
            title="Physics midterm",
            classroom=self.classroom,
            subject=self.subject,
            max_marks=100,
            scheduled_for=timezone.now().date(),
            created_by=self.tp
        )

    def test_assessment_creation_and_list(self):
        self.client.force_login(self.admin_user)
        
        # Test creation (POST) with correct fields max_marks and scheduled_for
        post_data = {
            "title": "Math exam",
            "classroom": self.classroom.id,
            "subject": self.subject.id,
            "points": 50,
            "due_at": "2026-08-10T10:00"
        }
        response = self.client.post(reverse("admin_assessments"), post_data)
        self.assertEqual(response.status_code, 302)
        
        # Verify created
        ass = Assessment.objects.get(title="Math exam")
        self.assertEqual(ass.max_marks, 50)
        self.assertEqual(str(ass.scheduled_for), "2026-08-10")
        
        # Check assessments list
        response = self.client.get(reverse("admin_assessments"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Physics midterm")
        self.assertContains(response, "Math exam")

    def test_assessment_detail_marks_management(self):
        self.client.force_login(self.admin_user)
        
        # GET request
        response = self.client.get(reverse("admin_assessment_detail", args=[self.assessment.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Physics midterm")
        self.assertContains(response, self.student.user.full_name.title())
        
        # POST: Save Draft Marks
        post_data = {
            "action": "save_marks",
            f"marks_{self.student.id}": "85.5",
            f"remarks_{self.student.id}": "Great progress!"
        }
        response = self.client.post(reverse("admin_assessment_detail", args=[self.assessment.id]), post_data)
        self.assertEqual(response.status_code, 302)
        
        # Verify Result saved
        from academics.models import Result, ExamResult
        res = Result.objects.get(assessment=self.assessment, student=self.student)
        self.assertEqual(res.marks_obtained, Decimal("85.5"))
        self.assertEqual(res.remarks, "Great progress!")
        self.assertIsNone(res.published_at)
        
        # POST: Publish Results (Trigger Results)
        post_data["action"] = "publish_results"
        response = self.client.post(reverse("admin_assessment_detail", args=[self.assessment.id]), post_data)
        self.assertEqual(response.status_code, 302)
        
        # Verify Result published
        res.refresh_from_db()
        self.assertIsNotNone(res.published_at)
        
        # Verify corresponding ExamResult created
        er = ExamResult.objects.get(student=self.student, assessment_name="Physics midterm")
        self.assertEqual(er.marks_obtained, Decimal("85.5"))
        self.assertEqual(er.total_marks, Decimal("100.00"))
        self.assertTrue(er.is_published)

    def test_assessment_detail_update_and_delete(self):
        self.client.force_login(self.admin_user)
        
        # POST: Update assessment details
        post_data = {
            "action": "update_details",
            "title": "Physics exam updated",
            "points": "90",
            "due_at": "2026-08-15"
        }
        response = self.client.post(reverse("admin_assessment_detail", args=[self.assessment.id]), post_data)
        self.assertEqual(response.status_code, 302)
        
        self.assessment.refresh_from_db()
        self.assertEqual(self.assessment.title, "Physics exam updated")
        self.assertEqual(self.assessment.max_marks, 90)
        self.assertEqual(str(self.assessment.scheduled_for), "2026-08-15")
        
        # POST: Delete assessment
        post_data = {
            "action": "delete_assessment"
        }
        response = self.client.post(reverse("admin_assessment_detail", args=[self.assessment.id]), post_data)
        self.assertEqual(response.status_code, 302)
        
        # Verify deleted
        self.assertFalse(Assessment.objects.filter(id=self.assessment.id).exists())

    def test_result_detail_and_print(self):
        self.client.force_login(self.admin_user)
        
        # Create a result
        res = Result.objects.create(
            assessment=self.assessment,
            student=self.student,
            marks_obtained=Decimal("95.00"),
            remarks="Excellent work!"
        )
        
        # 1. GET detailed score breakdown page
        response = self.client.get(reverse("admin_result_detail", args=[res.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.student.user.full_name.title())
        self.assertContains(response, "Excellent work!")
        self.assertContains(response, "95.00")
        
        # 2. GET printable report slip
        response = self.client.get(reverse("admin_result_print", args=[res.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "JSM SHIKSHA ACADEMY")
        self.assertContains(response, "Statement of Marks / Report Slip")
        
        # 3. POST: Edit Grade and Remarks
        post_data = {
            "action": "edit_grade",
            "marks_obtained": "80",
            "remarks": "Needs some improvement"
        }
        response = self.client.post(reverse("admin_result_detail", args=[res.id]), post_data)
        self.assertEqual(response.status_code, 302)
        
        res.refresh_from_db()
        self.assertEqual(res.marks_obtained, Decimal("80"))
        self.assertEqual(res.remarks, "Needs some improvement")
        self.assertEqual(res.grade, "A") # auto recalculated grade
        
        # 4. POST: Delete Result entry
        post_data = {
            "action": "delete_result"
        }
        response = self.client.post(reverse("admin_result_detail", args=[res.id]), post_data)
        self.assertEqual(response.status_code, 302)
        
        self.assertFalse(Result.objects.filter(id=res.id).exists())

    def test_attendance_session_detail_and_management(self):
        self.client.force_login(self.admin_user)
        
        # Create an attendance session
        sess = AttendanceSession.objects.create(
            classroom=self.classroom,
            subject=self.subject,
            date=timezone.now().date(),
            taken_by=self.tp,
            notes="Initial notes"
        )
        
        # 1. GET detailed attendance log roster page
        response = self.client.get(reverse("admin_attendance_session_detail", args=[sess.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.student.user.full_name.title())
        self.assertContains(response, "Initial notes")
        
        # 2. POST: Save attendance markings (Status Present -> Late)
        post_data = {
            "action": "save_attendance",
            f"status_{self.student.id}": "late",
            f"remarks_{self.student.id}": "Late because of traffic"
        }
        response = self.client.post(reverse("admin_attendance_session_detail", args=[sess.id]), post_data)
        self.assertEqual(response.status_code, 302)
        
        # Verify AttendanceRecord saved
        rec = AttendanceRecord.objects.get(session=sess, student=self.student)
        self.assertEqual(rec.status, "late")
        self.assertEqual(rec.remarks, "Late because of traffic")
        
        # 3. POST: Update session notes
        post_data = {
            "action": "update_notes",
            "notes": "Updated session remarks"
        }
        response = self.client.post(reverse("admin_attendance_session_detail", args=[sess.id]), post_data)
        self.assertEqual(response.status_code, 302)
        
        sess.refresh_from_db()
        self.assertEqual(sess.notes, "Updated session remarks")
        
        # 4. POST: Delete session completely
        post_data = {
            "action": "delete_session"
        }
        response = self.client.post(reverse("admin_attendance_session_detail", args=[sess.id]), post_data)
        self.assertEqual(response.status_code, 302)
        
        self.assertFalse(AttendanceSession.objects.filter(id=sess.id).exists())

    def test_attendance_record_lookup_and_edit(self):
        self.client.force_login(self.admin_user)
        
        # Create a session and record
        sess = AttendanceSession.objects.create(
            classroom=self.classroom,
            subject=self.subject,
            date=timezone.now().date(),
            taken_by=self.tp
        )
        rec = AttendanceRecord.objects.create(
            session=sess,
            student=self.student,
            status="present",
            remarks="On time"
        )
        
        # 1. GET attendance records list page
        response = self.client.get(reverse("admin_attendance_records"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.student.user.full_name.title())
        self.assertContains(response, "Present")
        
        # 2. POST: Edit attendance record status
        post_data = {
            "action": "edit_record",
            "record_id": rec.id,
            "status": "absent",
            "remarks": "Sick leave verified"
        }
        response = self.client.post(reverse("admin_attendance_records"), post_data)
        self.assertEqual(response.status_code, 302)
        
        rec.refresh_from_db()
        self.assertEqual(rec.status, "absent")
        self.assertEqual(rec.remarks, "Sick leave verified")
