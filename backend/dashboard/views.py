import datetime
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Q, Count
from django.utils import timezone
from django.http import Http404, HttpResponse

from users.models import User, StudentProfile, TeacherProfile
from academics.models import ClassRoom, Subject, Assessment, Result
from attendance.models import AttendanceSession, AttendanceRecord
from finance.models import FeePlan, Payment, StudentFee
from learning.models import Assignment, AssignmentSubmission, Note, VideoLecture, Quiz
from cms.models import Page, Course, Facility, GalleryItem, ContactMessage, Inquiry
from communication.models import Announcement, Notification

from .forms import (
    LoginForm, ContactForm, AdmissionInquiryForm, ProfileUpdateForm,
    StudentProfileForm, TeacherProfileForm, UserChangePasswordForm,
    AssignmentForm, NoteForm, VideoLectureForm, UserCRUDForm
)

# ----------------------------------------------------
# PUBLIC WEBSITE VIEWS
# ----------------------------------------------------

def home_view(request):
    courses = Course.objects.all()[:3]
    facilities = Facility.objects.all()[:3]
    announcements = Announcement.objects.filter(classroom__isnull=True).order_by("-created_at")[:3]
    gallery = GalleryItem.objects.all()[:6]
    
    # Calculate stats for home page
    stats = {
        "students": StudentProfile.objects.count() + 120,
        "teachers": TeacherProfile.objects.count() + 15,
        "courses": Course.objects.count() + 4,
        "facilities": Facility.objects.count() + 6
    }

    return render(request, "home/index.html", {
        "courses": courses,
        "facilities": facilities,
        "announcements": announcements,
        "gallery": gallery,
        "stats": stats
    })

def about_view(request):
    try:
        about_page = Page.objects.get(slug="about")
    except Page.DoesNotExist:
        about_page = None
    
    stats = {
        "students": StudentProfile.objects.count() + 120,
        "teachers": TeacherProfile.objects.count() + 15,
        "classrooms": ClassRoom.objects.count() + 8,
        "subjects": Subject.objects.count() + 24
    }
    return render(request, "home/about.html", {"about_page": about_page, "stats": stats})

def academics_view(request):
    classrooms = ClassRoom.objects.all()
    subjects = Subject.objects.all()
    return render(request, "home/academics.html", {
        "classrooms": classrooms,
        "subjects": subjects
    })

def courses_view(request):
    courses = Course.objects.all()
    return render(request, "home/courses.html", {"courses": courses})

def admission_view(request):
    if request.method == "POST":
        form = AdmissionInquiryForm(request.POST)
        if form.is_valid():
            inquiry = form.save(commit=False)
            if request.user.is_authenticated:
                inquiry.user = request.user
            inquiry.save()
            messages.success(
                request,
                "Thank you! Your admission inquiry has been received. Our team will contact you shortly.",
                extra_tags='inquiry_success'
            )
            return redirect("admission")
    else:
        initial_data = {}
        if request.user.is_authenticated:
            initial_data['email'] = request.user.email
            initial_data['phone'] = request.user.phone
            initial_data['student_name'] = f"{request.user.first_name} {request.user.last_name}".strip()
            if hasattr(request.user, 'student_profile'):
                initial_data['guardian_name'] = request.user.student_profile.guardian_name
                initial_data['phone'] = request.user.student_profile.guardian_phone or request.user.phone
        form = AdmissionInquiryForm(initial=initial_data)
    return render(request, "home/admission.html", {"form": form})

def facilities_view(request):
    facilities = Facility.objects.all()
    return render(request, "home/facilities.html", {"facilities": facilities})

def gallery_view(request):
    gallery_items = GalleryItem.objects.filter(is_published=True).order_by("-created_at")
    raw_categories = GalleryItem.objects.filter(is_published=True).values_list("category", flat=True)
    categories = sorted(list({cat.strip().title() for cat in raw_categories if cat and cat.strip()}))
    return render(request, "home/gallery.html", {
        "gallery_items": gallery_items,
        "categories": categories
    })

def contact_view(request):
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(
                request,
                "Your message has been sent successfully. We will get back to you soon.",
                extra_tags='contact_success'
            )
            return redirect("contact")
    else:
        form = ContactForm()
    return render(request, "home/contact.html", {"form": form})

# ----------------------------------------------------
# AUTHENTICATION VIEWS
# ----------------------------------------------------

def login_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard_redirect")
        
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            
            # Allow login using email or username
            user = authenticate(request, username=username, password=password)
            if user is not None:
                if user.registration_status == 'pending' or not user.is_active:
                    messages.error(
                        request,
                        "Your account registration is under review by our administration team. You will be able to log in as soon as it is approved.",
                        extra_tags='pending_approval'
                    )
                elif user.registration_status == 'rejected':
                    messages.error(request, f"Your registration request was rejected. Reason: {user.rejected_reason or 'No reason provided.'}")
                else:
                    auth_login(request, user)
                    messages.success(request, f"Welcome back, {user.full_name}!")
                    return redirect("dashboard_redirect")
            else:
                messages.error(request, "Invalid username or password.")
    else:
        form = LoginForm()
    return render(request, "accounts/login.html", {"form": form})

def logout_view(request):
    auth_logout(request)
    messages.success(request, "You have been logged out successfully.")
    return redirect("home")

@login_required
def dashboard_redirect(request):
    role = request.user.role
    if role == "admin":
        return redirect("admin_overview")
    elif role == "teacher":
        return redirect("teacher_overview")
    else:
        return redirect("student_overview")

@login_required
def my_profile(request):
    user = request.user
    
    if request.method == "POST":
        p_form = ProfileUpdateForm(request.POST, request.FILES, instance=user)
        pw_form = UserChangePasswordForm(request.POST)
        
        # Determine specific profile form
        sp_form = None
        tp_form = None
        if user.role == "student" and hasattr(user, "student_profile"):
            sp_form = StudentProfileForm(request.POST, instance=user.student_profile)
        elif user.role == "teacher" and hasattr(user, "teacher_profile"):
            tp_form = TeacherProfileForm(request.POST, instance=user.teacher_profile)
            
        action = request.POST.get("action")
        
        if action == "update_profile":
            if p_form.is_valid():
                p_form.save()
                
                # Save sub profile
                if sp_form and sp_form.is_valid():
                    sp_form.save()
                elif tp_form and tp_form.is_valid():
                    tp_form.save()
                    
                messages.success(request, "Profile updated successfully. Your changes have been saved.")
                return redirect("my_profile")
            else:
                messages.error(request, "Please correct the errors in the profile form.")
                
        elif action == "change_password":
            if pw_form.is_valid():
                old_pw = pw_form.cleaned_data["old_password"]
                new_pw = pw_form.cleaned_data["new_password"]
                confirm_pw = pw_form.cleaned_data["confirm_password"]
                
                if not user.check_password(old_pw):
                    messages.error(request, "Current password is incorrect.")
                elif new_pw != confirm_pw:
                    messages.error(request, "Passwords do not match.")
                else:
                    user.set_password(new_pw)
                    user.save()
                    update_session_auth_hash(request, user)
                    messages.success(request, "Your password has been changed successfully.")
                    return redirect("my_profile")
            else:
                messages.error(request, "Please correct the errors in the password form.")
    else:
        p_form = ProfileUpdateForm(instance=user)
        pw_form = UserChangePasswordForm()
        sp_form = StudentProfileForm(instance=user.student_profile) if user.role == "student" and hasattr(user, "student_profile") else None
        tp_form = TeacherProfileForm(instance=user.teacher_profile) if user.role == "teacher" and hasattr(user, "teacher_profile") else None
        
    return render(request, "accounts/profile.html", {
        "p_form": p_form,
        "pw_form": pw_form,
        "sp_form": sp_form,
        "tp_form": tp_form,
        "is_dashboard_view": True
    })

# ----------------------------------------------------
# STUDENT PORTAL VIEWS
# ----------------------------------------------------

@login_required
def student_overview(request):
    if request.user.role != "student":
        return redirect("dashboard_redirect")
        
    user = request.user
    sp = user.student_profile
    now = timezone.now()
    
    # Calculate Assignments Metrics
    total_assignments = Assignment.objects.filter(classroom=sp.classroom, is_published=True).count()
    completed_assignments = AssignmentSubmission.objects.filter(student=sp).count()
    pending_assignments = max(0, total_assignments - completed_assignments)
    due_today = Assignment.objects.filter(classroom=sp.classroom, is_published=True, due_at__date=now.date()).count()
    overdue = Assignment.objects.filter(
        classroom=sp.classroom, 
        is_published=True, 
        due_at__lt=now
    ).exclude(submissions__student=sp).count()

    # Calculate Fees Metrics
    total_fee = FeePlan.objects.filter(classroom=sp.classroom).aggregate(total=Sum('amount'))['total'] or 0
    paid_amount = Payment.objects.filter(student=sp, status='paid').aggregate(total=Sum('amount'))['total'] or 0
    remaining_fee = max(0, total_fee - paid_amount)

    # Calculate Attendance
    present_count = AttendanceRecord.objects.filter(student=sp, status='present').count()
    absent_count = AttendanceRecord.objects.filter(student=sp, status='absent').count()
    late_count = AttendanceRecord.objects.filter(student=sp, status='late').count()
    leave_count = AttendanceRecord.objects.filter(student=sp, status='excused').count()
    total_att = present_count + absent_count + late_count + leave_count
    att_percentage = int((present_count + late_count + leave_count) / total_att * 100) if total_att > 0 else None

    # Calculate Results Performance
    results = Result.objects.filter(student=sp)
    total_percentage = 0.0
    eval_count = 0
    subject_scores = {}
    monthly_scores = {}
    
    for r in results:
        max_marks = float(r.assessment.max_marks) if r.assessment and r.assessment.max_marks else 100.0
        obtained = float(r.marks_obtained)
        percent = (obtained / max_marks * 100) if max_marks > 0 else 0.0
        total_percentage += percent
        eval_count += 1
        
        sub_name = r.assessment.subject.name
        if sub_name not in subject_scores:
            subject_scores[sub_name] = []
        subject_scores[sub_name].append(percent)
        
        month_name = r.created_at.strftime("%b")
        if month_name not in monthly_scores:
            monthly_scores[month_name] = []
        monthly_scores[month_name].append(percent)
    
    overall_percentage = round(total_percentage / eval_count, 1) if eval_count > 0 else None
    overall_grade = "N/A"
    if overall_percentage is not None:
        if overall_percentage >= 90: overall_grade = "A+"
        elif overall_percentage >= 80: overall_grade = "A"
        elif overall_percentage >= 70: overall_grade = "B"
        elif overall_percentage >= 60: overall_grade = "C"
        elif overall_percentage >= 50: overall_grade = "D"
        else: overall_grade = "F"

    subject_performance = [
        {"name": sub, "results": round(sum(scores)/len(scores), 1)}
        for sub, scores in subject_scores.items()
    ]
    
    # Latest Updates Timeline
    updates = []
    announcements = Announcement.objects.filter(Q(classroom=sp.classroom) | Q(classroom__isnull=True)).order_by('-created_at')[:3]
    for a in announcements:
        updates.append({"type": "Announcement", "title": a.title, "date": a.created_at, "desc": a.body})
    
    new_assignments = Assignment.objects.filter(classroom=sp.classroom, is_published=True).order_by('-published_at')[:3]
    for ass in new_assignments:
        updates.append({"type": "Assignment", "title": f"New Task: {ass.title}", "date": ass.published_at, "desc": f"Due on {ass.due_at.strftime('%d %b, %Y')}"})
        
    updates.sort(key=lambda x: x["date"], reverse=True)
    today_events = updates[:5]

    # Quick Summary stats
    total_subjects = Subject.objects.filter(classroom=sp.classroom).count()
    upcoming_assignments = Assignment.objects.filter(classroom=sp.classroom, is_published=True, due_at__gt=now).count()
    last_result = Result.objects.filter(student=sp).order_by('-created_at').first()
    latest_result_str = f"{last_result.assessment.title}: {last_result.marks_obtained}/{last_result.assessment.max_marks} ({last_result.grade})" if last_result else "No evaluations yet"
    unread_notifications = Notification.objects.filter(recipient=user, read_at__isnull=True).count()
    learning_resources_available = Note.objects.filter(classroom=sp.classroom, is_published=True).count() + VideoLecture.objects.filter(classroom=sp.classroom, is_published=True).count()

    context = {
        "pending_assignments": pending_assignments,
        "completed_assignments": completed_assignments,
        "due_today": due_today,
        "overdue": overdue,
        
        "total_fee": total_fee,
        "paid_amount": paid_amount,
        "remaining_fee": remaining_fee,
        
        "att_percentage": att_percentage,
        "present_count": present_count,
        "absent_count": absent_count,
        "late_count": late_count,
        "leave_count": leave_count,
        "total_att": total_att,
        
        "overall_percentage": overall_percentage,
        "overall_grade": overall_grade,
        "subject_performance": subject_performance,
        "today_events": today_events,
        
        "total_subjects": total_subjects,
        "upcoming_assignments": upcoming_assignments,
        "latest_result": latest_result_str,
        "unread_notifications": unread_notifications,
        "learning_resources_available": learning_resources_available,
        "is_dashboard_view": True
    }
    return render(request, "student/overview.html", context)

@login_required
def student_assignments(request):
    if request.user.role != "student":
        return redirect("dashboard_redirect")
    
    sp = request.user.student_profile
    assignments = Assignment.objects.filter(classroom=sp.classroom, is_published=True).order_by("-due_at")
    submissions = AssignmentSubmission.objects.filter(student=sp)
    
    # Handle Submission upload
    if request.method == "POST":
        assignment_id = request.POST.get("assignment_id")
        text_answer = request.POST.get("text_answer", "")
        file_attachment = request.FILES.get("file")
        
        assignment = get_object_or_404(Assignment, id=assignment_id, classroom=sp.classroom)
        
        # Check if already submitted
        existing = submissions.filter(assignment=assignment).first()
        if existing:
            existing.text_answer = text_answer
            if file_attachment:
                existing.file = file_attachment
            existing.submitted_at = timezone.now()
            existing.status = "submitted"
            existing.save()
            messages.success(request, "Assignment submission updated successfully.")
        else:
            AssignmentSubmission.objects.create(
                assignment=assignment,
                student=sp,
                text_answer=text_answer,
                file=file_attachment,
                status="submitted"
            )
            messages.success(request, f"Assignment submitted successfully on {timezone.now().strftime('%d %b, %Y')} at {timezone.now().strftime('%H:%M')}.")
        return redirect("student_assignments")

    # Map assignments to their submission if any
    assignments_with_subs = []
    for ass in assignments:
        sub = submissions.filter(assignment=ass).first()
        assignments_with_subs.append({
            "assignment": ass,
            "submission": sub
        })
        
    return render(request, "student/assignments.html", {
        "assignments": assignments_with_subs,
        "is_dashboard_view": True
    })

@login_required
def student_learning(request):
    if request.user.role != "student":
        return redirect("dashboard_redirect")
        
    sp = request.user.student_profile
    notes = Note.objects.filter(classroom=sp.classroom, is_published=True).order_by("-created_at")
    videos = VideoLecture.objects.filter(classroom=sp.classroom, is_published=True).order_by("-created_at")
    
    # Filters
    search_query = request.GET.get("search", "")
    subject_filter = request.GET.get("subject", "")
    
    if search_query:
        notes = notes.filter(Q(title__icontains=search_query) | Q(description__icontains=search_query))
        videos = videos.filter(Q(title__icontains=search_query) | Q(description__icontains=search_query))
        
    if subject_filter:
        notes = notes.filter(subject__name=subject_filter)
        videos = videos.filter(subject__name=subject_filter)
        
    # Get subjects list
    subjects = Subject.objects.filter(classroom=sp.classroom)
    
    return render(request, "student/learning.html", {
        "notes": notes,
        "videos": videos,
        "subjects": subjects,
        "search_query": search_query,
        "subject_filter": subject_filter,
        "is_dashboard_view": True
    })

@login_required
def student_attendance(request):
    if request.user.role != "student":
        return redirect("dashboard_redirect")
        
    sp = request.user.student_profile
    records = AttendanceRecord.objects.filter(student=sp).order_by("-session__date")
    return render(request, "student/attendance.html", {
        "records": records,
        "is_dashboard_view": True
    })

@login_required
def student_results(request):
    if request.user.role != "student":
        return redirect("dashboard_redirect")
        
    sp = request.user.student_profile
    results = Result.objects.filter(student=sp).order_by("-assessment__scheduled_for")
    return render(request, "student/results.html", {
        "results": results,
        "is_dashboard_view": True
    })

@login_required
def student_payments(request):
    if request.user.role != "student":
        return redirect("dashboard_redirect")
        
    sp = request.user.student_profile
    plans = FeePlan.objects.filter(classroom=sp.classroom)
    payments = Payment.objects.filter(student=sp).order_by("-paid_at")
    
    # Calculate stats
    total_fee = plans.aggregate(total=Sum("amount"))["total"] or 0
    paid_fee = payments.filter(status="paid").aggregate(total=Sum("amount"))["total"] or 0
    remaining_fee = max(0, total_fee - paid_fee)
    
    plans_with_status = []
    for plan in plans:
        # Check if plan is paid in payments list
        matching_payment = payments.filter(fee_plan=plan, status="paid").first()
        plans_with_status.append({
            "plan": plan,
            "payment": matching_payment,
            "status": "Paid" if matching_payment else "Unpaid"
        })

    return render(request, "student/payments.html", {
        "plans": plans_with_status,
        "payments": payments,
        "total_fee": total_fee,
        "paid_fee": paid_fee,
        "remaining_fee": remaining_fee,
        "is_dashboard_view": True
    })

@login_required
def student_pay_fee(request, plan_id):
    if request.user.role != "student":
        return redirect("dashboard_redirect")
        
    sp = request.user.student_profile
    plan = get_object_or_404(FeePlan, id=plan_id, classroom=sp.classroom)
    
    # Create or update payment simulation as paid
    payment, created = Payment.objects.get_or_create(
        fee_plan=plan,
        student=sp,
        defaults={
            "amount": plan.amount,
            "status": "paid",
            "payment_method": "net_banking",
            "academic_session": "2026-27"
        }
    )
    if not created and payment.status != "paid":
        payment.status = "paid"
        payment.paid_at = timezone.now()
        payment.payment_method = "net_banking"
        payment.save()
        
    messages.success(request, f"Payment of ₹{plan.amount} for {plan.name} completed successfully. Receipt Number: {payment.receipt_number}")
    return redirect("student_payments")

# ----------------------------------------------------
# TEACHER PORTAL VIEWS
# ----------------------------------------------------

@login_required
def teacher_overview(request):
    if request.user.role != "teacher":
        return redirect("dashboard_redirect")
        
    tp = request.user.teacher_profile
    classrooms = tp.classrooms.all()
    subjects = Subject.objects.filter(teacher=tp)
    
    # Calculate stats
    students_count = StudentProfile.objects.filter(classroom__in=classrooms).distinct().count()
    assignments_count = Assignment.objects.filter(teacher=tp).count()
    notes_count = Note.objects.filter(teacher=tp).count()
    videos_count = VideoLecture.objects.filter(teacher=tp).count()
    
    announcements = Announcement.objects.filter(created_by=request.user).order_by("-created_at")[:5]
    
    return render(request, "teacher/overview.html", {
        "students_count": students_count,
        "assignments_count": assignments_count,
        "notes_count": notes_count,
        "videos_count": videos_count,
        "announcements": announcements,
        "is_dashboard_view": True
    })

@login_required
def teacher_students(request):
    if request.user.role != "teacher":
        return redirect("dashboard_redirect")
        
    tp = request.user.teacher_profile
    classrooms = tp.classrooms.all()
    
    # Get students belonging to classrooms
    students = StudentProfile.objects.filter(classroom__in=classrooms).select_related("user", "classroom").order_by("classroom__name", "roll_number")
    
    search_query = request.GET.get("search", "")
    class_filter = request.GET.get("class", "")
    
    if search_query:
        students = students.filter(Q(user__first_name__icontains=search_query) | Q(user__last_name__icontains=search_query) | Q(admission_number__icontains=search_query))
    if class_filter:
        students = students.filter(classroom_id=class_filter)
        
    return render(request, "teacher/students.html", {
        "students": students,
        "classrooms": classrooms,
        "search_query": search_query,
        "class_filter": class_filter,
        "is_dashboard_view": True
    })

@login_required
def teacher_attendance(request):
    if request.user.role != "teacher":
        return redirect("dashboard_redirect")
        
    tp = request.user.teacher_profile
    classrooms = tp.classrooms.all()
    subjects = Subject.objects.filter(teacher=tp)
    
    # Handle Attendance marking
    if request.method == "POST":
        class_id = request.POST.get("classroom")
        subject_id = request.POST.get("subject")
        date_str = request.POST.get("date")
        
        classroom = get_object_or_404(ClassRoom, id=class_id)
        subject = get_object_or_404(Subject, id=subject_id)
        date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        
        # Create Attendance Session
        session, created = AttendanceSession.objects.get_or_create(
            classroom=classroom,
            subject=subject,
            date=date,
            defaults={"taken_by": tp}
        )
        
        # Create/Update Records for each student
        students = StudentProfile.objects.filter(classroom=classroom)
        for student in students:
            status = request.POST.get(f"status_{student.id}", "present")
            remarks = request.POST.get(f"remarks_{student.id}", "")
            
            AttendanceRecord.objects.update_or_create(
                session=session,
                student=student,
                defaults={"status": status, "remarks": remarks}
            )
            
        messages.success(request, f"Attendance for {classroom.name} - {subject.name} on {date_str} recorded successfully.")
        return redirect("teacher_attendance")
        
    # Get marked sessions
    sessions = AttendanceSession.objects.filter(taken_by=tp).order_by("-date")
    
    # Load students if classroom is in request GET
    classroom_id = request.GET.get("classroom")
    subject_id = request.GET.get("subject")
    date_str = request.GET.get("date")
    
    students = None
    if classroom_id:
        students = StudentProfile.objects.filter(classroom_id=classroom_id).order_by("roll_number")
        
    now_date = timezone.now().date().isoformat()
    
    return render(request, "teacher/attendance.html", {
        "classrooms": classrooms,
        "subjects": subjects,
        "sessions": sessions,
        "students": students,
        "selected_class_id": classroom_id,
        "selected_sub_id": subject_id,
        "selected_date": date_str or now_date,
        "now_date": now_date,
        "is_dashboard_view": True
    })

@login_required
def teacher_assignments(request):
    if request.user.role != "teacher":
        return redirect("dashboard_redirect")
        
    tp = request.user.teacher_profile
    assignments = Assignment.objects.filter(teacher=tp).order_by("-created_at")
    classrooms = tp.classrooms.all()
    subjects = Subject.objects.filter(teacher=tp)
    
    if request.method == "POST":
        form = AssignmentForm(request.POST, request.FILES)
        if form.is_valid():
            assignment = form.save(commit=False)
            assignment.teacher = tp
            assignment.save()
            messages.success(request, f"Assignment '{assignment.title}' published successfully.")
            return redirect("teacher_assignments")
    else:
        form = AssignmentForm()
        
    return render(request, "teacher/assignments.html", {
        "assignments": assignments,
        "form": form,
        "is_dashboard_view": True
    })

@login_required
def teacher_learning(request):
    if request.user.role != "teacher":
        return redirect("dashboard_redirect")
        
    tp = request.user.teacher_profile
    notes = Note.objects.filter(teacher=tp).order_by("-created_at")
    videos = VideoLecture.objects.filter(teacher=tp).order_by("-created_at")
    
    note_form = NoteForm()
    video_form = VideoLectureForm()
    
    if request.method == "POST":
        action = request.POST.get("action")
        if action == "publish_note":
            form = NoteForm(request.POST, request.FILES)
            if form.is_valid():
                note = form.save(commit=False)
                note.teacher = tp
                note.save()
                messages.success(request, f"Note handout '{note.title}' uploaded successfully.")
                return redirect("teacher_learning")
        elif action == "publish_video":
            form = VideoLectureForm(request.POST, request.FILES)
            if form.is_valid():
                video = form.save(commit=False)
                video.teacher = tp
                video.save()
                messages.success(request, f"Video lesson '{video.title}' published successfully.")
                return redirect("teacher_learning")
                
    return render(request, "teacher/learning.html", {
        "notes": notes,
        "videos": videos,
        "note_form": note_form,
        "video_form": video_form,
        "is_dashboard_view": True
    })

@login_required
def teacher_results(request):
    if request.user.role != "teacher":
        return redirect("dashboard_redirect")
        
    tp = request.user.teacher_profile
    assessments = Assessment.objects.filter(created_by=tp).order_by("-scheduled_for")
    
    # Handle creating new assessment
    if request.method == "POST":
        title = request.POST.get("title")
        classroom_id = request.POST.get("classroom")
        subject_id = request.POST.get("subject")
        a_type = request.POST.get("assessment_type", "test")
        max_marks = request.POST.get("max_marks", 100)
        date_str = request.POST.get("scheduled_for")
        
        classroom = get_object_or_404(ClassRoom, id=classroom_id)
        subject = get_object_or_404(Subject, id=subject_id)
        
        Assessment.objects.create(
            title=title,
            classroom=classroom,
            subject=subject,
            assessment_type=a_type,
            max_marks=max_marks,
            scheduled_for=date_str,
            created_by=tp
        )
        messages.success(request, f"Assessment '{title}' created successfully.")
        return redirect("teacher_results")
        
    classrooms = tp.classrooms.all()
    subjects = Subject.objects.filter(teacher=tp)
    
    return render(request, "teacher/results.html", {
        "assessments": assessments,
        "classrooms": classrooms,
        "subjects": subjects,
        "is_dashboard_view": True
    })

# ----------------------------------------------------
# ADMIN PORTAL VIEWS
# ----------------------------------------------------

@login_required
def admin_overview(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    # Gather statistics
    student_count = StudentProfile.objects.count()
    teacher_count = TeacherProfile.objects.count()
    total_classrooms = ClassRoom.objects.count()
    total_subjects = Subject.objects.count()
    
    total_payments = Payment.objects.filter(status='paid').count()
    total_pending = Payment.objects.filter(status='pending').count()
    fee_perc = int((total_payments / (total_payments + total_pending) * 100)) if (total_payments + total_pending) > 0 else 0
    
    inquiries = Inquiry.objects.all().order_by("-created_at")[:5]
    messages_logs = ContactMessage.objects.all().order_by("-created_at")[:5]

    return render(request, "admin/overview.html", {
        "student_count": student_count,
        "teacher_count": teacher_count,
        "total_classrooms": total_classrooms,
        "total_subjects": total_subjects,
        "fee_perc": fee_perc,
        "inquiries": inquiries,
        "messages_logs": messages_logs,
        "is_dashboard_view": True
    })

@login_required
def admin_users(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    users = User.objects.all().order_by("-date_joined")
    return render(request, "admin/users.html", {
        "users": users,
        "is_dashboard_view": True
    })

@login_required
def admin_user_create(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    if request.method == "POST":
        form = UserCRUDForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            pw = form.cleaned_data.get("password") or "Jsm@12345"
            user.set_password(pw)
            user.save()
            messages.success(request, f"User account '{user.username}' created successfully.")
            return redirect("admin_users")
    else:
        form = UserCRUDForm()
    return render(request, "admin/user_form.html", {"form": form, "is_dashboard_view": True})

@login_required
def admin_user_edit(request, user_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    edit_user = get_object_or_404(User, id=user_id)
    if request.method == "POST":
        form = UserCRUDForm(request.POST, instance=edit_user)
        if form.is_valid():
            user = form.save(commit=False)
            pw = form.cleaned_data.get("password")
            if pw:
                user.set_password(pw)
            user.save()
            messages.success(request, f"User account '{user.username}' updated successfully.")
            return redirect("admin_users")
    else:
        form = UserCRUDForm(instance=edit_user)
    return render(request, "admin/user_form.html", {"form": form, "is_dashboard_view": True})

@login_required
def admin_user_delete(request, user_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    del_user = get_object_or_404(User, id=user_id)
    if del_user == request.user:
        messages.error(request, "You cannot delete your own account.")
    else:
        del_user.delete()
        messages.success(request, "User account deleted successfully.")
    return redirect("admin_users")

@login_required
def admin_students(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    students = StudentProfile.objects.all().select_related("user", "classroom").order_by("classroom__name", "roll_number")
    classrooms = ClassRoom.objects.all()
    return render(request, "admin/students.html", {
        "students": students,
        "classrooms": classrooms,
        "is_dashboard_view": True
    })

@login_required
def admin_teachers(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    teachers = TeacherProfile.objects.all().select_related("user").order_by("user__first_name")
    return render(request, "admin/teachers.html", {
        "teachers": teachers,
        "is_dashboard_view": True
    })

@login_required
def admin_teacher_assign(request, teacher_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    teacher = get_object_or_404(TeacherProfile, id=teacher_id)
    
    if request.method == "POST":
        classroom_ids = request.POST.getlist("classrooms")
        subject_ids = request.POST.getlist("subjects")
        
        # Update ClassRooms (Class Teacher role)
        ClassRoom.objects.filter(class_teacher=teacher).update(class_teacher=None)
        if classroom_ids:
            ClassRoom.objects.filter(id__in=classroom_ids).update(class_teacher=teacher)
            
        # Update Subjects (Teaching load)
        Subject.objects.filter(teacher=teacher).update(teacher=None)
        if subject_ids:
            Subject.objects.filter(id__in=subject_ids).update(teacher=teacher)
            
        messages.success(request, f"Assignments for '{teacher.user.full_name}' updated successfully.")
        return redirect("admin_teachers")
        
    classrooms = ClassRoom.objects.all().order_by("name", "section")
    subjects = Subject.objects.all().select_related("classroom").order_by("classroom__name", "name")
    
    assigned_classroom_ids = ClassRoom.objects.filter(class_teacher=teacher).values_list("id", flat=True)
    assigned_subject_ids = Subject.objects.filter(teacher=teacher).values_list("id", flat=True)
    
    return render(request, "admin/assign_workload.html", {
        "teacher": teacher,
        "classrooms": classrooms,
        "subjects": subjects,
        "assigned_classroom_ids": list(assigned_classroom_ids),
        "assigned_subject_ids": list(assigned_subject_ids),
        "is_dashboard_view": True
    })

@login_required
def admin_classes(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    classrooms = ClassRoom.objects.all().order_by("name")
    
    if request.method == "POST":
        name = request.POST.get("name")
        section = request.POST.get("section")
        teacher_id = request.POST.get("class_teacher")
        
        teacher = get_object_or_404(TeacherProfile, id=teacher_id) if teacher_id else None
        
        ClassRoom.objects.create(name=name, section=section, class_teacher=teacher)
        messages.success(request, f"Classroom Level '{name}-{section}' created successfully.")
        return redirect("admin_classes")
        
    teachers = TeacherProfile.objects.all()
    return render(request, "admin/classes.html", {
        "classrooms": classrooms,
        "teachers": teachers,
        "is_dashboard_view": True
    })



@login_required
def admin_payments(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    # Auto link students to active classroom fee plans
    for student in StudentProfile.objects.all().select_related("classroom"):
        if student.classroom:
            plans = FeePlan.objects.filter(classroom=student.classroom, is_active=True)
            for plan in plans:
                StudentFee.objects.get_or_create(
                    student=student, 
                    fee_plan=plan, 
                    academic_year=plan.academic_year
                )

    q = request.GET.get("q", "").strip()
    class_filter = request.GET.get("classroom", "")
    status_filter = request.GET.get("status", "")
    
    # Query StudentFee records
    fee_ledgers = StudentFee.objects.all().select_related(
        "student__user", "student__classroom", "fee_plan"
    )
    
    if q:
        fee_ledgers = fee_ledgers.filter(
            Q(student__user__first_name__icontains=q) | 
            Q(student__user__last_name__icontains=q) |
            Q(student__admission_number__icontains=q) |
            Q(student__roll_number__icontains=q)
        )
    if class_filter:
        fee_ledgers = fee_ledgers.filter(student__classroom_id=class_filter)
        
    # Python-side list compilation to dynamically fetch properties and statuses
    ledger_list = []
    for ledger in fee_ledgers:
        status = ledger.payment_status
        if status_filter and status != status_filter:
            continue
        
        # Get last payment
        last_payment = Payment.objects.filter(
            student=ledger.student, 
            status=Payment.Status.PAID
        ).order_by("-paid_at").first()
        
        ledger_list.append({
            "ledger": ledger,
            "total_fee": ledger.total_fee,
            "amount_paid": ledger.amount_paid,
            "remaining_balance": ledger.remaining_balance,
            "status": status,
            "last_payment_date": last_payment.paid_at if last_payment else None,
            "payment_method": last_payment.method if last_payment else "—",
            "receipt_id": last_payment.id if last_payment else None
        })

    # Summary Stats
    all_paid_payments = Payment.objects.filter(status=Payment.Status.PAID)
    today = timezone.now().date()
    start_of_week = timezone.now() - timezone.timedelta(days=7)
    start_of_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    start_of_year = timezone.now().replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    
    todays_collection = all_paid_payments.filter(paid_at__date=today).aggregate(total=Sum("amount"))["total"] or 0.00
    weekly_collection = all_paid_payments.filter(paid_at__gte=start_of_week).aggregate(total=Sum("amount"))["total"] or 0.00
    monthly_collection = all_paid_payments.filter(paid_at__gte=start_of_month).aggregate(total=Sum("amount"))["total"] or 0.00
    yearly_collection = all_paid_payments.filter(paid_at__gte=start_of_year).aggregate(total=Sum("amount"))["total"] or 0.00
    total_revenue = all_paid_payments.aggregate(total=Sum("amount"))["total"] or 0.00
    
    paid_payments_count = all_paid_payments.count()
    average_collection = total_revenue / paid_payments_count if paid_payments_count > 0 else 0.00
    
    total_pending = sum(item["remaining_balance"] for item in ledger_list)
    paid_count = sum(1 for item in ledger_list if item["status"] == StudentFee.Status.PAID)
    pending_count = sum(1 for item in ledger_list if item["status"] != StudentFee.Status.PAID)
    
    # Overdue payments count
    overdue_count = 0
    for item in ledger_list:
        if item["status"] != StudentFee.Status.PAID:
            due_date = item["ledger"].fee_plan.due_date
            if due_date and due_date < today:
                overdue_count += 1
                
    classrooms = ClassRoom.objects.all()
    return render(request, "admin/payments.html", {
        "ledger_list": ledger_list,
        "classrooms": classrooms,
        "todays_collection": todays_collection,
        "weekly_collection": weekly_collection,
        "monthly_collection": monthly_collection,
        "yearly_collection": yearly_collection,
        "total_revenue": total_revenue,
        "total_pending": total_pending,
        "paid_count": paid_count,
        "pending_count": pending_count,
        "overdue_count": overdue_count,
        "average_collection": average_collection,
        "is_dashboard_view": True,
        "q": q,
        "class_filter": int(class_filter) if class_filter else "",
        "status_filter": status_filter
    })

@login_required
def admin_payment_history(request, student_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    student = get_object_or_404(StudentProfile, id=student_id)
    
    # Auto get/create StudentFee
    fee_ledgers = StudentFee.objects.filter(student=student)
    if not fee_ledgers.exists() and student.classroom:
        plans = FeePlan.objects.filter(classroom=student.classroom, is_active=True)
        for plan in plans:
            StudentFee.objects.get_or_create(student=student, fee_plan=plan, academic_year=plan.academic_year)
        fee_ledgers = StudentFee.objects.filter(student=student)
        
    fee_ledger = fee_ledgers.first()
    
    if request.method == "POST":
        amount = request.POST.get("amount")
        method = request.POST.get("method")
        payment_type = request.POST.get("payment_type")
        installment = request.POST.get("installment_period", "Annual")
        transaction_id = request.POST.get("transaction_id", "")
        
        # Create immutable transaction
        Payment.objects.create(
            student=student,
            fee_plan=fee_ledger.fee_plan if fee_ledger else None,
            student_fee=fee_ledger,
            amount=amount,
            status=Payment.Status.PAID,
            method=method,
            payment_type=payment_type,
            installment_period=installment,
            transaction_id=transaction_id,
            collected_by=request.user.full_name
        )
        
        # Create Notification
        Notification.objects.create(
            recipient=student.user,
            title="Payment Successful",
            message=f"₹{amount} received. Receipt generated successfully."
        )
        # Create Admin notification
        admin_users = User.objects.filter(role="admin")
        for admin in admin_users:
            Notification.objects.create(
                recipient=admin,
                title="Fee Collection Recorded",
                message=f"{student.user.full_name} paid ₹{amount} via {method}."
            )
            
        messages.success(request, f"Offline payment of ₹{amount} recorded successfully.")
        return redirect("admin_payment_history", student_id=student_id)

    # Base query for filters
    payments_all = Payment.objects.filter(student=student)
    
    # Get last payment details before filtering
    last_payment_obj = payments_all.filter(status=Payment.Status.PAID).order_by("-paid_at").first()
    last_payment_date = last_payment_obj.paid_at if last_payment_obj else None

    # Apply filters
    q = request.GET.get("q", "")
    method_filter = request.GET.get("method", "")
    status_filter = request.GET.get("status", "")
    installment_filter = request.GET.get("installment", "")
    start_date = request.GET.get("start_date", "")
    end_date = request.GET.get("end_date", "")

    payments = payments_all
    if q:
        payments = payments.filter(
            Q(receipt_number__icontains=q) |
            Q(transaction_id__icontains=q)
        )
    if method_filter:
        payments = payments.filter(method=method_filter)
    if status_filter:
        payments = payments.filter(status=status_filter)
    if installment_filter:
        payments = payments.filter(installment_period=installment_filter)
    if start_date:
        payments = payments.filter(paid_at__date__gte=start_date)
    if end_date:
        payments = payments.filter(paid_at__date__lte=end_date)

    payments = payments.order_by("-created_at")
    
    # Calculate Installment statuses
    paid_installments = list(payments_all.filter(status=Payment.Status.PAID).values_list("installment_period", flat=True))
    
    # Calculate Overdue state
    from django.utils import timezone
    is_overdue = False
    if fee_ledger and fee_ledger.remaining_balance > 0 and fee_ledger.fee_plan.due_date:
        is_overdue = fee_ledger.fee_plan.due_date < timezone.now().date()

    if fee_ledger:
        if fee_ledger.remaining_balance == 0:
            payment_status_display = "Paid"
        elif fee_ledger.amount_paid > 0:
            payment_status_display = "Overdue" if is_overdue else "Partial"
        else:
            payment_status_display = "Overdue" if is_overdue else "Pending"
    else:
        payment_status_display = "Pending"

    return render(request, "admin/payment_history.html", {
        "student": student,
        "fee_ledger": fee_ledger,
        "payments": payments,
        "paid_installments": paid_installments,
        "last_payment_date": last_payment_date,
        "payment_status_display": payment_status_display,
        "is_overdue": is_overdue,
        "is_dashboard_view": True,
        # Filters to populate fields
        "q": q,
        "method_filter": method_filter,
        "status_filter": status_filter,
        "installment_filter": installment_filter,
        "start_date": start_date,
        "end_date": end_date,
    })

@login_required
def admin_update_fee_adjustments(request, fee_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    fee = get_object_or_404(StudentFee, id=fee_id)
    if request.method == "POST":
        fee.discount = request.POST.get("discount", 0.00)
        fee.scholarship = request.POST.get("scholarship", 0.00)
        fee.waived_amount = request.POST.get("waived_amount", 0.00)
        fee.save()
        messages.success(request, f"Fee adjustments updated for {fee.student.user.full_name}.")
    return redirect("admin_payment_history", student_id=fee.student.id)
@login_required
def admin_receipt_pdf(request, payment_id):
    payment = get_object_or_404(Payment, id=payment_id)
    return render(request, "admin/receipt_pdf.html", {
        "payment": payment,
        "school_logo": "/static/images/logo.png"
    })

@login_required
def admin_payment_edit(request, payment_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    payment = get_object_or_404(Payment, id=payment_id)
    if request.method == "POST":
        payment.amount = request.POST.get("amount")
        payment.status = request.POST.get("status")
        payment.method = request.POST.get("method")
        payment.payment_type = request.POST.get("payment_type")
        payment.installment_period = request.POST.get("installment_period")
        payment.transaction_id = request.POST.get("transaction_id", "")
        payment.save()
        
        # Recalculate StudentFee balance
        if payment.student_fee:
            payment.student_fee.save()
            
        messages.success(request, "Transaction updated successfully.")
        return redirect("admin_payment_history", student_id=payment.student.id)
        
    return render(request, "admin/payment_edit.html", {
        "payment": payment,
        "is_dashboard_view": True
    })

@login_required
def admin_payment_delete(request, payment_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    payment = get_object_or_404(Payment, id=payment_id)
    student_id = payment.student.id
    payment.delete()
    
    # Recalculate StudentFee balance
    fee_ledgers = StudentFee.objects.filter(student_id=student_id)
    for ledger in fee_ledgers:
        ledger.save()
        
    messages.success(request, "Transaction deleted successfully.")
    return redirect("admin_payment_history", student_id=student_id)

@login_required
def admin_finance_reports(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    payments = Payment.objects.filter(status=Payment.Status.PAID)
    
    # Filter by Date range
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")
    if start_date:
        payments = payments.filter(paid_at__date__gte=start_date)
    if end_date:
        payments = payments.filter(paid_at__date__lte=end_date)
        
    # Group by payment method
    method_report = payments.values("method").annotate(total=Sum("amount")).order_by("-total")
    # Group by payment type
    type_report = payments.values("payment_type").annotate(total=Sum("amount")).order_by("-total")
    
    # Class-wise collection report
    class_report = []
    for cls in ClassRoom.objects.all():
        total_class = payments.filter(student__classroom=cls).aggregate(total=Sum("amount"))["total"] or 0.00
        class_report.append({
            "classroom": cls,
            "total": total_class
        })
        
    # Export CSV
    if request.GET.get("export") == "csv":
        import csv
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="fee_collection_report.csv"'
        writer = csv.writer(response)
        writer.writerow(['Receipt Number', 'Student Name', 'Classroom', 'Amount', 'Method', 'Paid Date'])
        for p in payments:
            writer.writerow([p.receipt_number, p.student.user.full_name, p.student.classroom.name if p.student.classroom else "—", p.amount, p.get_method_display(), p.paid_at.strftime('%Y-%m-%d %H:%M')])
        return response
        
    return render(request, "admin/finance_reports.html", {
        "payments": payments,
        "method_report": method_report,
        "type_report": type_report,
        "class_report": class_report,
        "start_date": start_date,
        "end_date": end_date,
        "is_dashboard_view": True
    })

@login_required
def student_payments(request):
    if request.user.role != "student":
        return redirect("dashboard_redirect")
        
    student = request.user.student_profile
    
    # Auto get/create StudentFee
    fee_ledgers = StudentFee.objects.filter(student=student)
    if not fee_ledgers.exists() and student.classroom:
        plans = FeePlan.objects.filter(classroom=student.classroom, is_active=True)
        for plan in plans:
            StudentFee.objects.get_or_create(student=student, fee_plan=plan, academic_year=plan.academic_year)
        fee_ledgers = StudentFee.objects.filter(student=student)
        
    fee_ledger = fee_ledgers.first()
    payments = Payment.objects.filter(student=student).order_by("-created_at")
    
    paid_installments = list(payments.filter(status=Payment.Status.PAID).values_list("installment_period", flat=True))
    
    return render(request, "student/payments.html", {
        "fee_ledger": fee_ledger,
        "payments": payments,
        "paid_installments": paid_installments,
        "is_dashboard_view": True
    })

@login_required
def student_pay_now(request, fee_id):
    if request.user.role != "student":
        return redirect("dashboard_redirect")
        
    fee = get_object_or_404(StudentFee, id=fee_id)
    student = request.user.student_profile
    
    if request.method == "POST":
        amount = request.POST.get("amount")
        method = request.POST.get("method")
        payment_type = request.POST.get("payment_type")
        installment = request.POST.get("installment_period", "Annual")
        transaction_id = f"TXN-{random.randint(100000, 999999)}"
        
        # Create payment
        Payment.objects.create(
            student=student,
            fee_plan=fee.fee_plan,
            student_fee=fee,
            amount=amount,
            status=Payment.Status.PAID,
            method=method,
            payment_type=payment_type,
            installment_period=installment,
            transaction_id=transaction_id,
            collected_by="Online Portal"
        )
        
        # Notifications
        Notification.objects.create(
            recipient=student.user,
            title="Payment Successful",
            message=f"Payment Successful. ₹{amount} received. Receipt generated successfully."
        )
        admin_users = User.objects.filter(role="admin")
        for admin in admin_users:
            Notification.objects.create(
                recipient=admin,
                title="Fee Collection Recorded",
                message=f"{student.user.full_name} paid ₹{amount} via {method}."
            )
            
        messages.success(request, f"Online payment simulation of ₹{amount} completed successfully!")
    return redirect("student_payments")

@login_required
def admin_courses(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
    
    q = request.GET.get("q", "").strip()
    published_filter = request.GET.get("published", "")
    
    courses = Course.objects.all().order_by("title")
    if q:
        courses = courses.filter(Q(title__icontains=q) | Q(code__icontains=q))
    if published_filter:
        is_pub = (published_filter == "1")
        courses = courses.filter(is_published=is_pub)
        
    if request.method == "POST":
        title = request.POST.get("title")
        code = request.POST.get("code")
        description = request.POST.get("description")
        grade_range = request.POST.get("grade_range", "UKG - Grade 8")
        duration = request.POST.get("duration", "")
        image = request.FILES.get("image")
        is_featured = request.POST.get("is_featured") == "on"
        is_published = request.POST.get("is_published") == "on"
        
        from django.utils.text import slugify
        slug = slugify(title)
        original_slug = slug
        counter = 1
        while Course.objects.filter(slug=slug).exists():
            slug = f"{original_slug}-{counter}"
            counter += 1
            
        Course.objects.create(
            title=title, code=code, slug=slug, description=description,
            grade_range=grade_range, duration=duration, image=image,
            is_featured=is_featured, is_published=is_published
        )
        messages.success(request, f"Course '{title}' created successfully.")
        return redirect("admin_courses")
        
    return render(request, "admin/courses.html", {
        "courses": courses,
        "is_dashboard_view": True,
        "q": q,
        "published_filter": published_filter
    })

@login_required
def admin_course_edit(request, course_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    course = get_object_or_404(Course, id=course_id)
    if request.method == "POST":
        course.title = request.POST.get("title")
        course.code = request.POST.get("code")
        course.description = request.POST.get("description")
        course.grade_range = request.POST.get("grade_range", "UKG - Grade 8")
        course.duration = request.POST.get("duration", "")
        if request.FILES.get("image"):
            course.image = request.FILES.get("image")
        course.is_featured = request.POST.get("is_featured") == "on"
        course.is_published = request.POST.get("is_published") == "on"
        
        from django.utils.text import slugify
        course.slug = slugify(course.title)
        
        course.save()
        messages.success(request, f"Course '{course.title}' updated successfully.")
        return redirect("admin_courses")
        
    return render(request, "admin/course_edit.html", {
        "course": course,
        "is_dashboard_view": True
    })

@login_required
def admin_course_delete(request, course_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    course = get_object_or_404(Course, id=course_id)
    course.delete()
    messages.success(request, "Course deleted successfully.")
    return redirect("admin_courses")

@login_required
def admin_facilities(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    facilities = Facility.objects.all().order_by("sort_order", "title")
    
    if request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description")
        icon = request.POST.get("icon", "fa-solid fa-school")
        image = request.FILES.get("image")
        sort_order = int(request.POST.get("sort_order", 0))
        is_published = request.POST.get("is_published") == "on"
        
        Facility.objects.create(
            title=title, description=description, icon=icon,
            image=image, sort_order=sort_order, is_published=is_published
        )
        messages.success(request, f"Facility '{title}' created successfully.")
        return redirect("admin_facilities")
        
    return render(request, "admin/facilities.html", {
        "facilities": facilities,
        "is_dashboard_view": True
    })

@login_required
def admin_facility_edit(request, facility_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    facility = get_object_or_404(Facility, id=facility_id)
    if request.method == "POST":
        facility.title = request.POST.get("title")
        facility.description = request.POST.get("description")
        facility.icon = request.POST.get("icon", "fa-solid fa-school")
        if request.FILES.get("image"):
            facility.image = request.FILES.get("image")
        facility.sort_order = int(request.POST.get("sort_order", 0))
        facility.is_published = request.POST.get("is_published") == "on"
        facility.save()
        messages.success(request, f"Facility '{facility.title}' updated successfully.")
        return redirect("admin_facilities")
        
    return render(request, "admin/facility_edit.html", {
        "facility": facility,
        "is_dashboard_view": True
    })

@login_required
def admin_facility_delete(request, facility_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    facility = get_object_or_404(Facility, id=facility_id)
    facility.delete()
    messages.success(request, "Facility deleted successfully.")
    return redirect("admin_facilities")

@login_required
def admin_gallery(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    category_filter = request.GET.get("category", "")
    gallery_items = GalleryItem.objects.all().order_by("-created_at")
    
    if category_filter:
        gallery_items = gallery_items.filter(category=category_filter)
        
    if request.method == "POST":
        files = request.FILES.getlist("images")
        category = request.POST.get("category", "events")
        title = request.POST.get("title", "")
        
        if files:
            for f in files:
                t = title if title else f.name.split('.')[0][:100]
                GalleryItem.objects.create(
                    title=t, category=category, image=f, is_published=True
                )
            messages.success(request, f"{len(files)} gallery image(s) uploaded successfully.")
        else:
            image = request.FILES.get("image")
            if image:
                GalleryItem.objects.create(
                    title=title, category=category, image=image, is_published=True
                )
                messages.success(request, f"Gallery item '{title}' uploaded successfully.")
            else:
                messages.error(request, "No image uploaded.")
        return redirect("admin_gallery")
        
    return render(request, "admin/gallery.html", {
        "gallery_items": gallery_items,
        "is_dashboard_view": True,
        "category_filter": category_filter
    })

@login_required
def admin_gallery_edit(request, item_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    item = get_object_or_404(GalleryItem, id=item_id)
    if request.method == "POST":
        item.title = request.POST.get("title")
        item.category = request.POST.get("category", "events")
        if request.FILES.get("image"):
            item.image = request.FILES.get("image")
        item.is_published = request.POST.get("is_published") == "on"
        item.save()
        messages.success(request, f"Gallery item '{item.title}' updated successfully.")
        return redirect("admin_gallery")
        
    return render(request, "admin/gallery_edit.html", {
        "item": item,
        "is_dashboard_view": True
    })

@login_required
def admin_gallery_delete(request, item_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    item = get_object_or_404(GalleryItem, id=item_id)
    item.delete()
    messages.success(request, "Gallery item deleted successfully.")
    return redirect("admin_gallery")

@login_required
def admin_contact_messages(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    q = request.GET.get("q", "").strip()
    status_filter = request.GET.get("status", "")
    
    messages_list = ContactMessage.objects.all().order_by("-created_at")
    if q:
        messages_list = messages_list.filter(Q(name__icontains=q) | Q(subject__icontains=q) | Q(message__icontains=q))
    if status_filter:
        messages_list = messages_list.filter(status=status_filter)
        
    return render(request, "admin/contact_messages.html", {
        "messages_list": messages_list,
        "is_dashboard_view": True,
        "q": q,
        "status_filter": status_filter,
        "status_choices": ContactMessage.Status.choices
    })

@login_required
def admin_contact_message_status(request, msg_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    msg = get_object_or_404(ContactMessage, id=msg_id)
    if request.method == "POST":
        status = request.POST.get("status")
        if status in dict(ContactMessage.Status.choices):
            msg.status = status
            msg.save()
            messages.success(request, f"Message status updated to '{msg.get_status_display()}'.")
        return redirect("admin_contact_messages")
    return redirect("admin_contact_messages")

@login_required
def admin_contact_message_delete(request, msg_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    msg = get_object_or_404(ContactMessage, id=msg_id)
    msg.delete()
    messages.success(request, "Contact message deleted successfully.")
    return redirect("admin_contact_messages")

@login_required
def admin_inquiries(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    q = request.GET.get("q", "").strip()
    status_filter = request.GET.get("status", "")
    
    inquiries = Inquiry.objects.select_related("user").all().order_by("-created_at")
    if q:
        inquiries = inquiries.filter(Q(student_name__icontains=q) | Q(guardian_name__icontains=q) | Q(message__icontains=q))
    if status_filter:
        inquiries = inquiries.filter(status=status_filter)
        
    if request.GET.get("export") == "csv":
        import csv
        from django.http import HttpResponse
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="inquiries_export.csv"'
        writer = csv.writer(response)
        writer.writerow(['Student Name', 'Guardian Name', 'Linked User', 'Email', 'Phone', 'Preferred Class', 'Status', 'Date'])
        for inq in inquiries:
            username = inq.user.username if inq.user else 'Guest'
            writer.writerow([inq.student_name, inq.guardian_name, username, inq.email, inq.phone, inq.preferred_class, inq.get_status_display(), inq.created_at.strftime('%Y-%m-%d')])
        return response
        
    return render(request, "admin/inquiries.html", {
        "inquiries": inquiries,
        "is_dashboard_view": True,
        "q": q,
        "status_filter": status_filter,
        "status_choices": Inquiry.Status.choices
    })

@login_required
def admin_inquiry_status(request, inq_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    inq = get_object_or_404(Inquiry, id=inq_id)
    if request.method == "POST":
        status = request.POST.get("status")
        if status in dict(Inquiry.Status.choices):
            inq.status = status
            inq.save()
            messages.success(request, f"Inquiry status updated to '{inq.get_status_display()}'.")
        return redirect("admin_inquiries")
    return redirect("admin_inquiries")

@login_required
def admin_inquiry_delete(request, inq_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    inq = get_object_or_404(Inquiry, id=inq_id)
    inq.delete()
    messages.success(request, "Inquiry deleted successfully.")
    return redirect("admin_inquiries")

@login_required
def admin_subjects(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    q = request.GET.get("q", "").strip()
    classroom_filter = request.GET.get("classroom", "")
    teacher_filter = request.GET.get("teacher", "")
    status_filter = request.GET.get("status", "")
    
    subjects = Subject.objects.all().select_related("classroom", "teacher").order_by("classroom__name", "name")
    
    if q:
        subjects = subjects.filter(Q(name__icontains=q) | Q(code__icontains=q))
    if classroom_filter:
        subjects = subjects.filter(classroom_id=classroom_filter)
    if teacher_filter:
        subjects = subjects.filter(teacher_id=teacher_filter)
    if status_filter:
        is_act = (status_filter == "active")
        subjects = subjects.filter(is_active=is_act)
        
    if request.method == "POST":
        name = request.POST.get("name")
        code = request.POST.get("code")
        classroom_id = request.POST.get("classroom")
        teacher_id = request.POST.get("teacher")
        is_active = request.POST.get("is_active") == "on"
        
        if Subject.objects.filter(code=code).exists():
            messages.error(request, f"Error: Subject code '{code}' already exists.")
            return redirect("admin_subjects")
            
        classroom = get_object_or_404(ClassRoom, id=classroom_id)
        teacher = get_object_or_404(TeacherProfile, id=teacher_id) if teacher_id else None
        
        Subject.objects.create(name=name, code=code, classroom=classroom, teacher=teacher, is_active=is_active)
        messages.success(request, f"Subject '{name}' created successfully.")
        return redirect("admin_subjects")
        
    classrooms = ClassRoom.objects.all()
    teachers = TeacherProfile.objects.filter(user__is_active=True)
    
    return render(request, "admin/subjects.html", {
        "subjects": subjects,
        "classrooms": classrooms,
        "teachers": teachers,
        "is_dashboard_view": True,
        "q": q,
        "classroom_filter": int(classroom_filter) if classroom_filter else "",
        "teacher_filter": int(teacher_filter) if teacher_filter else "",
        "status_filter": status_filter
    })

@login_required
def admin_subject_edit(request, subject_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    subject = get_object_or_404(Subject, id=subject_id)
    
    if request.method == "POST":
        name = request.POST.get("name")
        code = request.POST.get("code")
        classroom_id = request.POST.get("classroom")
        teacher_id = request.POST.get("teacher")
        is_active = request.POST.get("is_active") == "on"
        
        if Subject.objects.filter(code=code).exclude(id=subject_id).exists():
            messages.error(request, f"Error: Subject code '{code}' already exists.")
            return redirect("admin_subjects")
            
        classroom = get_object_or_404(ClassRoom, id=classroom_id)
        teacher = get_object_or_404(TeacherProfile, id=teacher_id) if teacher_id else None
        
        subject.name = name
        subject.code = code
        subject.classroom = classroom
        subject.teacher = teacher
        subject.is_active = is_active
        subject.save()
        
        messages.success(request, f"Subject '{name}' updated successfully.")
        return redirect("admin_subjects")
        
    classrooms = ClassRoom.objects.all()
    teachers = TeacherProfile.objects.filter(user__is_active=True)
    
    return render(request, "admin/subject_edit.html", {
        "subject": subject,
        "classrooms": classrooms,
        "teachers": teachers,
        "is_dashboard_view": True
    })

@login_required
def admin_subject_delete(request, subject_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    subject = get_object_or_404(Subject, id=subject_id)
    
    # Check if linked to active academic records
    if AttendanceSession.objects.filter(subject=subject).exists():
        messages.error(request, f"Cannot delete subject '{subject.name}' because it has linked attendance sessions.")
        return redirect("admin_subjects")
        
    if Assessment.objects.filter(subject=subject).exists():
        messages.error(request, f"Cannot delete subject '{subject.name}' because it has linked assessments.")
        return redirect("admin_subjects")
        
    if Note.objects.filter(subject=subject).exists() or VideoLecture.objects.filter(subject=subject).exists():
        messages.error(request, f"Cannot delete subject '{subject.name}' because it has linked notes or lectures.")
        return redirect("admin_subjects")
        
    subject.delete()
    messages.success(request, f"Subject deleted successfully.")
    return redirect("admin_subjects")

@login_required
def admin_assessments(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
    
    q = request.GET.get("q", "").strip()
    assessments = Assessment.objects.all().select_related("classroom", "subject").order_by("-created_at")
    if q:
        assessments = assessments.filter(Q(title__icontains=q) | Q(subject__name__icontains=q))
        
    if request.method == "POST":
        title = request.POST.get("title")
        subject_id = request.POST.get("subject")
        classroom_id = request.POST.get("classroom")
        points = int(request.POST.get("points", 100))
        due_at = request.POST.get("due_at")
        
        subject = get_object_or_404(Subject, id=subject_id)
        classroom = get_object_or_404(ClassRoom, id=classroom_id)
        
        Assessment.objects.create(
            title=title, subject=subject, classroom=classroom, points=points, due_at=due_at
        )
        messages.success(request, f"Assessment '{title}' created successfully.")
        return redirect("admin_assessments")
        
    classrooms = ClassRoom.objects.all()
    subjects = Subject.objects.all()
    return render(request, "admin/assessments.html", {
        "assessments": assessments,
        "classrooms": classrooms,
        "subjects": subjects,
        "is_dashboard_view": True,
        "q": q
    })

@login_required
def admin_results(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    q = request.GET.get("q", "").strip()
    results = Result.objects.all().select_related("student__user", "assessment__subject").order_by("-created_at")
    if q:
        results = results.filter(Q(student__user__first_name__icontains=q) | Q(student__user__last_name__icontains=q) | Q(assessment__title__icontains=q))
        
    return render(request, "admin/results.html", {
        "results": results,
        "is_dashboard_view": True,
        "q": q
    })

@login_required
def admin_attendance_sessions(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    q = request.GET.get("q", "").strip()
    sessions = AttendanceSession.objects.all().select_related("classroom", "subject").order_by("-date")
    if q:
        sessions = sessions.filter(Q(classroom__name__icontains=q) | Q(subject__name__icontains=q))
        
    return render(request, "admin/attendance_sessions.html", {
        "sessions": sessions,
        "is_dashboard_view": True,
        "q": q
    })

@login_required
def admin_attendance_records(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    q = request.GET.get("q", "").strip()
    records = AttendanceRecord.objects.all().select_related("student__user", "session").order_by("-session__date")
    if q:
        records = records.filter(Q(student__user__first_name__icontains=q) | Q(student__user__last_name__icontains=q))
        
    return render(request, "admin/attendance_records.html", {
        "records": records,
        "is_dashboard_view": True,
        "q": q
    })

@login_required
def admin_assignments(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    q = request.GET.get("q", "").strip()
    assignments = Assignment.objects.all().select_related("classroom", "subject").order_by("-created_at")
    if q:
        assignments = assignments.filter(Q(title__icontains=q) | Q(subject__name__icontains=q))
        
    if request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description", "")
        subject_id = request.POST.get("subject")
        classroom_id = request.POST.get("classroom")
        points = int(request.POST.get("points", 100))
        due_at = request.POST.get("due_at")
        
        subject = get_object_or_404(Subject, id=subject_id)
        classroom = get_object_or_404(ClassRoom, id=classroom_id)
        
        Assignment.objects.create(
            title=title, description=description, subject=subject, classroom=classroom, points=points, due_at=due_at
        )
        messages.success(request, f"Assignment '{title}' created successfully.")
        return redirect("admin_assignments")
        
    classrooms = ClassRoom.objects.all()
    subjects = Subject.objects.all()
    return render(request, "admin/assignments.html", {
        "assignments": assignments,
        "classrooms": classrooms,
        "subjects": subjects,
        "is_dashboard_view": True,
        "q": q
    })

@login_required
def admin_assignments_delete(request, assignment_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
    a = get_object_or_404(Assignment, id=assignment_id)
    a.delete()
    messages.success(request, "Assignment deleted successfully.")
    return redirect("admin_assignments")

@login_required
def admin_submissions(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    q = request.GET.get("q", "").strip()
    submissions = AssignmentSubmission.objects.all().select_related("student__user", "assignment").order_by("-submitted_at")
    if q:
        submissions = submissions.filter(Q(student__user__first_name__icontains=q) | Q(student__user__last_name__icontains=q) | Q(assignment__title__icontains=q))
        
    return render(request, "admin/submissions.html", {
        "submissions": submissions,
        "is_dashboard_view": True,
        "q": q
    })

@login_required
def admin_notes(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    q = request.GET.get("q", "").strip()
    notes = Note.objects.all().select_related("classroom", "subject").order_by("-created_at")
    if q:
        notes = notes.filter(Q(title__icontains=q) | Q(subject__name__icontains=q))
        
    if request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description", "")
        subject_id = request.POST.get("subject")
        classroom_id = request.POST.get("classroom")
        file_obj = request.FILES.get("file")
        
        subject = get_object_or_404(Subject, id=subject_id)
        classroom = get_object_or_404(ClassRoom, id=classroom_id)
        
        Note.objects.create(
            title=title, description=description, subject=subject, classroom=classroom, file=file_obj
        )
        messages.success(request, f"Note handout '{title}' uploaded successfully.")
        return redirect("admin_notes")
        
    classrooms = ClassRoom.objects.all()
    subjects = Subject.objects.all()
    return render(request, "admin/notes.html", {
        "notes": notes,
        "classrooms": classrooms,
        "subjects": subjects,
        "is_dashboard_view": True,
        "q": q
    })

@login_required
def admin_notes_delete(request, note_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
    n = get_object_or_404(Note, id=note_id)
    n.delete()
    messages.success(request, "Note deleted successfully.")
    return redirect("admin_notes")

@login_required
def admin_videos(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    q = request.GET.get("q", "").strip()
    videos = VideoLecture.objects.all().select_related("classroom", "subject").order_by("-created_at")
    if q:
        videos = videos.filter(Q(title__icontains=q) | Q(subject__name__icontains=q))
        
    if request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description", "")
        subject_id = request.POST.get("subject")
        classroom_id = request.POST.get("classroom")
        video_url = request.POST.get("video_url")
        
        subject = get_object_or_404(Subject, id=subject_id)
        classroom = get_object_or_404(ClassRoom, id=classroom_id)
        
        VideoLecture.objects.create(
            title=title, description=description, subject=subject, classroom=classroom, video_url=video_url
        )
        messages.success(request, f"Video lecture '{title}' published successfully.")
        return redirect("admin_videos")
        
    classrooms = ClassRoom.objects.all()
    subjects = Subject.objects.all()
    return render(request, "admin/videos.html", {
        "videos": videos,
        "classrooms": classrooms,
        "subjects": subjects,
        "is_dashboard_view": True,
        "q": q
    })

@login_required
def admin_videos_delete(request, video_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
    v = get_object_or_404(VideoLecture, id=video_id)
    v.delete()
    messages.success(request, "Video lecture deleted successfully.")
    return redirect("admin_videos")

@login_required
def admin_quizzes(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    q = request.GET.get("q", "").strip()
    quizzes = Quiz.objects.all().select_related("classroom", "subject").order_by("-created_at")
    if q:
        quizzes = quizzes.filter(Q(title__icontains=q) | Q(subject__name__icontains=q))
        
    if request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description", "")
        subject_id = request.POST.get("subject")
        classroom_id = request.POST.get("classroom")
        
        subject = get_object_or_404(Subject, id=subject_id)
        classroom = get_object_or_404(ClassRoom, id=classroom_id)
        
        Quiz.objects.create(
            title=title, description=description, subject=subject, classroom=classroom
        )
        messages.success(request, f"Quiz '{title}' created successfully.")
        return redirect("admin_quizzes")
        
    classrooms = ClassRoom.objects.all()
    subjects = Subject.objects.all()
    return render(request, "admin/quizzes.html", {
        "quizzes": quizzes,
        "classrooms": classrooms,
        "subjects": subjects,
        "is_dashboard_view": True,
        "q": q
    })

@login_required
def admin_quizzes_delete(request, quiz_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
    qz = get_object_or_404(Quiz, id=quiz_id)
    qz.delete()
    messages.success(request, "Quiz deleted successfully.")
    return redirect("admin_quizzes")

@login_required
def admin_fee_plans(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    plans = FeePlan.objects.all().select_related("classroom")
    
    # Search and Filter
    q = request.GET.get("q", "")
    classroom_filter = request.GET.get("classroom", "")
    status_filter = request.GET.get("status", "")
    
    if q:
        plans = plans.filter(title__icontains=q)
    if classroom_filter:
        plans = plans.filter(classroom_id=classroom_filter)
    if status_filter:
        is_act = status_filter == "active"
        plans = plans.filter(is_active=is_act)
        
    plans = plans.order_by("-created_at")
    
    # Pagination
    from django.core.paginator import Paginator
    paginator = Paginator(plans, 12)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    if request.method == "POST":
        title = request.POST.get("title")
        classroom_id = request.POST.get("classroom")
        academic_year = request.POST.get("academic_year", "2026-27")
        admission_fee = request.POST.get("admission_fee", 0.00)
        tuition_fee = request.POST.get("tuition_fee", 0.00)
        exam_fee = request.POST.get("exam_fee", 0.00)
        computer_fee = request.POST.get("computer_fee", 0.00)
        library_fee = request.POST.get("library_fee", 0.00)
        sports_fee = request.POST.get("sports_fee", 0.00)
        transport_fee = request.POST.get("transport_fee", 0.00)
        misc_fee = request.POST.get("misc_fee", 0.00)
        discount = request.POST.get("discount", 0.00)
        scholarship = request.POST.get("scholarship", 0.00)
        late_fee = request.POST.get("late_fee", 0.00)
        due_date = request.POST.get("due_date")
        fee_type = request.POST.get("fee_type", "annual")
        
        classroom = get_object_or_404(ClassRoom, id=classroom_id)
        
        # Safe float conversion
        def to_dec(val):
            try:
                return float(val) if val else 0.00
            except ValueError:
                return 0.00

        FeePlan.objects.create(
            title=title,
            classroom=classroom,
            academic_year=academic_year,
            admission_fee=to_dec(admission_fee),
            tuition_fee=to_dec(tuition_fee),
            exam_fee=to_dec(exam_fee),
            computer_fee=to_dec(computer_fee),
            library_fee=to_dec(library_fee),
            sports_fee=to_dec(sports_fee),
            transport_fee=to_dec(transport_fee),
            misc_fee=to_dec(misc_fee),
            discount=to_dec(discount),
            scholarship=to_dec(scholarship),
            late_fee=to_dec(late_fee),
            due_date=due_date,
            fee_type=fee_type,
            is_active=True
        )
        messages.success(request, f"Fee plan '{title}' created successfully.")
        return redirect("admin_fee_plans")
        
    classrooms = ClassRoom.objects.all()
    return render(request, "admin/fee_plans.html", {
        "plans": page_obj,
        "classrooms": classrooms,
        "is_dashboard_view": True,
        "q": q,
        "classroom_filter": classroom_filter,
        "status_filter": status_filter,
    })

@login_required
def admin_fee_plans_edit(request, plan_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    plan = get_object_or_404(FeePlan, id=plan_id)
    if request.method == "POST":
        plan.title = request.POST.get("title")
        plan.classroom = get_object_or_404(ClassRoom, id=request.POST.get("classroom"))
        plan.academic_year = request.POST.get("academic_year", "2026-27")
        
        # Safe float conversion
        def to_dec(val):
            try:
                return float(val) if val else 0.00
            except ValueError:
                return 0.00
                
        plan.admission_fee = to_dec(request.POST.get("admission_fee", 0.00))
        plan.tuition_fee = to_dec(request.POST.get("tuition_fee", 0.00))
        plan.exam_fee = to_dec(request.POST.get("exam_fee", 0.00))
        plan.computer_fee = to_dec(request.POST.get("computer_fee", 0.00))
        plan.library_fee = to_dec(request.POST.get("library_fee", 0.00))
        plan.sports_fee = to_dec(request.POST.get("sports_fee", 0.00))
        plan.transport_fee = to_dec(request.POST.get("transport_fee", 0.00))
        plan.misc_fee = to_dec(request.POST.get("misc_fee", 0.00))
        plan.discount = to_dec(request.POST.get("discount", 0.00))
        plan.scholarship = to_dec(request.POST.get("scholarship", 0.00))
        plan.late_fee = to_dec(request.POST.get("late_fee", 0.00))
        plan.due_date = request.POST.get("due_date")
        plan.fee_type = request.POST.get("fee_type", "annual")
        plan.is_active = request.POST.get("is_active") == "on"
        plan.save()
        
        # Also save updates in calculated amounts of student fees linked to this plan
        for student_fee in plan.student_fees.all():
            # Update to recalculate properties
            student_fee.save()
            
        messages.success(request, f"Fee plan '{plan.title}' updated successfully.")
        return redirect("admin_fee_plans")
        
    classrooms = ClassRoom.objects.all()
    return render(request, "admin/fee_plan_edit.html", {
        "plan": plan,
        "classrooms": classrooms,
        "is_dashboard_view": True
    })

@login_required
def admin_fee_plans_delete(request, plan_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
    p = get_object_or_404(FeePlan, id=plan_id)
    p.delete()
    messages.success(request, "Fee plan deleted successfully.")
    return redirect("admin_fee_plans")

@login_required
def admin_fee_plans_duplicate(request, plan_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    p = get_object_or_404(FeePlan, id=plan_id)
    FeePlan.objects.create(
        title=f"Copy of {p.title}",
        classroom=p.classroom,
        academic_year=p.academic_year,
        admission_fee=p.admission_fee,
        tuition_fee=p.tuition_fee,
        exam_fee=p.exam_fee,
        computer_fee=p.computer_fee,
        library_fee=p.library_fee,
        sports_fee=p.sports_fee,
        transport_fee=p.transport_fee,
        misc_fee=p.misc_fee,
        discount=p.discount,
        scholarship=p.scholarship,
        late_fee=p.late_fee,
        due_date=p.due_date,
        fee_type=p.fee_type,
        is_active=p.is_active
    )
    messages.success(request, f"Fee plan '{p.title}' duplicated successfully.")
    return redirect("admin_fee_plans")

@login_required
def admin_fee_plans_toggle_active(request, plan_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    p = get_object_or_404(FeePlan, id=plan_id)
    p.is_active = not p.is_active
    p.save()
    status_str = "activated" if p.is_active else "archived"
    messages.success(request, f"Fee plan '{p.title}' {status_str} successfully.")
    return redirect("admin_fee_plans")

@login_required
def admin_fee_plans_bulk(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    if request.method == "POST":
        action = request.POST.get("action")
        plan_ids = request.POST.getlist("plan_ids")
        if action == "delete":
            FeePlan.objects.filter(id__in=plan_ids).delete()
            messages.success(request, "Selected fee plans deleted successfully.")
        elif action == "activate":
            FeePlan.objects.filter(id__in=plan_ids).update(is_active=True)
            messages.success(request, "Selected fee plans activated successfully.")
        elif action == "archive":
            FeePlan.objects.filter(id__in=plan_ids).update(is_active=False)
            messages.success(request, "Selected fee plans archived successfully.")
            
    return redirect("admin_fee_plans")

@login_required
def admin_announcements(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    announcements = Announcement.objects.all().order_by("-created_at")
    
    if request.method == "POST":
        title = request.POST.get("title")
        content = request.POST.get("content")
        
        Announcement.objects.create(title=title, content=content)
        messages.success(request, "Announcement published successfully.")
        return redirect("admin_announcements")
        
    return render(request, "admin/announcements.html", {
        "announcements": announcements,
        "is_dashboard_view": True
    })

@login_required
def admin_announcements_delete(request, ann_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
    a = get_object_or_404(Announcement, id=ann_id)
    a.delete()
    messages.success(request, "Announcement deleted successfully.")
    return redirect("admin_announcements")

@login_required
def admin_notifications(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    notifications = Notification.objects.all().select_related("recipient").order_by("-created_at")
    
    if request.method == "POST":
        user_id = request.POST.get("user")
        title = request.POST.get("title")
        message = request.POST.get("message")
        
        target_user = get_object_or_404(User, id=user_id)
        Notification.objects.create(recipient=target_user, title=title, message=message)
        messages.success(request, f"Notification sent to '{target_user.full_name}'.")
        return redirect("admin_notifications")
        
    users = User.objects.all().order_by("username")
    return render(request, "admin/notifications.html", {
        "notifications": notifications,
        "users": users,
        "is_dashboard_view": True
    })

@login_required
def admin_notifications_delete(request, notif_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
    n = get_object_or_404(Notification, id=notif_id)
    n.delete()
    messages.success(request, "Notification deleted successfully.")
    return redirect("admin_notifications")

@login_required
def admin_profile_redirect(request):
    return redirect("my_profile")


@login_required
def admin_id_cards(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    q = request.GET.get("q", "").strip()
    role_filter = request.GET.get("role", "")
    
    students = StudentProfile.objects.all().select_related("user", "classroom")
    teachers = TeacherProfile.objects.all().select_related("user")
    
    if q:
        students = students.filter(
            Q(user__first_name__icontains=q) | 
            Q(user__last_name__icontains=q) |
            Q(admission_number__icontains=q)
        )
        teachers = teachers.filter(
            Q(user__first_name__icontains=q) | 
            Q(user__last_name__icontains=q) |
            Q(employee_id__icontains=q)
        )
        
    student_list = [{"type": "student", "profile": s, "name": s.user.full_name, "id": s.id, "identifier": s.admission_number, "classroom": s.classroom.name if s.classroom else "—"} for s in students]
    teacher_list = [{"type": "teacher", "profile": t, "name": t.user.full_name, "id": t.id, "identifier": t.employee_id, "classroom": t.designation} for t in teachers]
    
    combined_list = []
    if role_filter == "student":
        combined_list = student_list
    elif role_filter == "teacher":
        combined_list = teacher_list
    else:
        combined_list = student_list + teacher_list
        
    # Pagination
    from django.core.paginator import Paginator
    paginator = Paginator(combined_list, 15)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return render(request, "admin/id_cards.html", {
        "cards": page_obj,
        "is_dashboard_view": True,
        "q": q,
        "role_filter": role_filter
    })

@login_required
def admin_id_card_view(request, role, profile_id):
    # Only Admin or the owner can view
    is_admin = request.user.role == "admin"
    
    profile = None
    if role == "student":
        profile = get_object_or_404(StudentProfile, id=profile_id)
        if not is_admin and request.user != profile.user:
            return redirect("dashboard_redirect")
    elif role == "teacher":
        profile = get_object_or_404(TeacherProfile, id=profile_id)
        if not is_admin and request.user != profile.user:
            return redirect("dashboard_redirect")
    else:
        return redirect("dashboard_redirect")
        
    # Generate verification link for QR Code
    verify_url = request.build_absolute_uri(f"/verify/id/{profile.user.username}/")
    
    return render(request, "admin/id_card_view.html", {
        "role": role,
        "profile": profile,
        "verify_url": verify_url,
        "is_dashboard_view": True
    })

@login_required
def admin_id_card_print(request, role, profile_id):
    is_admin = request.user.role == "admin"
    profile = None
    if role == "student":
        profile = get_object_or_404(StudentProfile, id=profile_id)
        if not is_admin and request.user != profile.user:
            return redirect("dashboard_redirect")
    elif role == "teacher":
        profile = get_object_or_404(TeacherProfile, id=profile_id)
        if not is_admin and request.user != profile.user:
            return redirect("dashboard_redirect")
    else:
        return redirect("dashboard_redirect")
        
    verify_url = request.build_absolute_uri(f"/verify/id/{profile.user.username}/")
    
    return render(request, "admin/id_card_print.html", {
        "role": role,
        "profile": profile,
        "verify_url": verify_url
    })

def verify_id_card(request, verification_code):
    user = get_object_or_404(User, username=verification_code)
    profile = None
    role = user.role
    if role == "student" and hasattr(user, "student_profile"):
        profile = user.student_profile
    elif role == "teacher" and hasattr(user, "teacher_profile"):
        profile = user.teacher_profile
        
    return render(request, "accounts/id_card_verify.html", {
        "user_profile": user,
        "profile": profile,
        "role": role
    })


def student_register(request):
    if request.user.is_authenticated:
        return redirect("dashboard_redirect")
        
    classrooms = ClassRoom.objects.all()
    
    if request.method == "POST":
        first_name = request.POST.get("first_name")
        last_name = request.POST.get("last_name")
        gender = request.POST.get("gender")
        date_of_birth = request.POST.get("date_of_birth")
        admission_class = request.POST.get("admission_class")
        blood_group = request.POST.get("blood_group")
        previous_school = request.POST.get("previous_school")
        father_name = request.POST.get("father_name")
        mother_name = request.POST.get("mother_name")
        parent_phone = request.POST.get("parent_phone")
        aadhaar_number = request.POST.get("aadhaar_number")
        address = request.POST.get("address")
        city = request.POST.get("city")
        state = request.POST.get("state")
        pincode = request.POST.get("pincode")
        email = request.POST.get("email")
        phone = request.POST.get("phone")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")
        
        username = request.POST.get("username") or email
        
        # Validation checks
        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return render(request, "accounts/student_register.html", {"classrooms": classrooms})
            
        if not username:
            messages.error(request, "Username or email is required.")
            return render(request, "accounts/student_register.html", {"classrooms": classrooms})
            
        if User.objects.filter(username=username).exists():
            messages.error(request, "Username/Email is already taken.")
            return render(request, "accounts/student_register.html", {"classrooms": classrooms})

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email is already registered.")
            return render(request, "accounts/student_register.html", {"classrooms": classrooms})
            
        # Create User
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            role=User.Roles.STUDENT,
            gender=gender,
            date_of_birth=date_of_birth if date_of_birth else None,
            registration_status='pending'
        )
        user.phone = phone
        user.address = address
        user.city = city
        user.state = state
        user.pincode = pincode
        if request.FILES.get("avatar"):
            user.avatar = request.FILES.get("avatar")
        user.is_active = False
        user.save()
        
        # Update StudentProfile
        profile, created = StudentProfile.objects.get_or_create(user=user)
        profile.guardian_name = father_name or mother_name or ""
        profile.guardian_phone = parent_phone
        profile.father_name = father_name
        profile.mother_name = mother_name
        profile.date_of_birth = date_of_birth if date_of_birth else None
        profile.admission_class = admission_class
        profile.blood_group = blood_group
        profile.previous_school = previous_school
        profile.aadhaar_number = aadhaar_number
        profile.status = StudentProfile.Status.INACTIVE
        profile.is_profile_complete = False
        profile.save()
        
        return render(request, "accounts/register_success.html", {
            "name": user.full_name,
            "role": "Student"
        })
        
    return render(request, "accounts/student_register.html", {"classrooms": classrooms})


def teacher_register(request):
    if request.user.is_authenticated:
        return redirect("dashboard_redirect")
        
    if request.method == "POST":
        first_name = request.POST.get("first_name")
        last_name = request.POST.get("last_name")
        gender = request.POST.get("gender")
        date_of_birth = request.POST.get("date_of_birth")
        blood_group = request.POST.get("blood_group")
        emergency_contact = request.POST.get("emergency_contact")
        address = request.POST.get("address")
        city = request.POST.get("city")
        state = request.POST.get("state")
        pincode = request.POST.get("pincode")
        
        qualification = request.POST.get("qualification")
        experience_years = request.POST.get("experience_years")
        department = request.POST.get("department")
        subjects_taught = request.POST.get("subjects_taught")
        
        email = request.POST.get("email")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")
        
        username = request.POST.get("username") or email
        
        # Validation checks
        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return render(request, "accounts/teacher_register.html")
            
        if not username:
            messages.error(request, "Username or email is required.")
            return render(request, "accounts/teacher_register.html")
            
        if User.objects.filter(username=username).exists():
            messages.error(request, "Username/Email is already taken.")
            return render(request, "accounts/teacher_register.html")

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email address is already registered.")
            return render(request, "accounts/teacher_register.html")
            
        # Create User
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            role=User.Roles.TEACHER,
            gender=gender,
            date_of_birth=date_of_birth if date_of_birth else None,
            registration_status='pending'
        )
        user.phone = request.POST.get("phone", "")
        user.address = address
        user.city = city
        user.state = state
        user.pincode = pincode
        if request.FILES.get("avatar"):
            user.avatar = request.FILES.get("avatar")
        user.is_active = False
        user.save()
        
        # Update TeacherProfile
        profile, created = TeacherProfile.objects.get_or_create(user=user)
        profile.qualification = qualification
        try:
            profile.experience_years = int(experience_years) if experience_years else 0
        except ValueError:
            profile.experience_years = 0
        profile.department = department
        profile.subjects_taught = subjects_taught
        profile.blood_group = blood_group
        profile.emergency_contact = emergency_contact
        profile.status = TeacherProfile.Status.INACTIVE
        profile.is_profile_complete = False
        
        # File uploads
        if request.FILES.get("resume"):
            profile.resume = request.FILES.get("resume")
        if request.FILES.get("certificate"):
            profile.certificate = request.FILES.get("certificate")
            
        profile.save()
        
        return render(request, "accounts/register_success.html", {
            "name": user.full_name,
            "role": "Teacher"
        })
        
    return render(request, "accounts/teacher_register.html")


@login_required
def admin_pending_registrations(request):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    pending_students = StudentProfile.objects.filter(user__registration_status='pending').select_related('user')
    pending_teachers = TeacherProfile.objects.filter(user__registration_status='pending').select_related('user')
    
    classrooms = ClassRoom.objects.all()
    
    return render(request, "admin/pending_registrations.html", {
        "pending_students": pending_students,
        "pending_teachers": pending_teachers,
        "classrooms": classrooms,
        "is_dashboard_view": True
    })

@login_required
def admin_approve_registration(request, role, user_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    user = get_object_or_404(User, id=user_id)
    classroom_id = request.POST.get("classroom")
    
    if role == "student":
        profile = get_object_or_404(StudentProfile, user=user)
        # Generate Admission Number and Student ID
        total_students = StudentProfile.objects.exclude(admission_number="").count()
        seq = total_students + 1
        std_username = f"STD2026{seq:04d}"
        adm_no = f"ADM2026{seq:04d}"
        
        # Verify uniqueness
        while User.objects.filter(username=std_username).exists():
            seq += 1
            std_username = f"STD2026{seq:04d}"
            adm_no = f"ADM2026{seq:04d}"
            
        user.username = std_username
        profile.admission_number = adm_no
        profile.roll_number = str(seq)
        
        if classroom_id:
            profile.classroom = get_object_or_404(ClassRoom, id=classroom_id)
            
        profile.status = StudentProfile.Status.ACTIVE
        profile.save()
        
        # Link to classroom fee plans automatically
        if profile.classroom:
            plans = FeePlan.objects.filter(classroom=profile.classroom, is_active=True)
            for plan in plans:
                StudentFee.objects.get_or_create(
                    student=profile,
                    fee_plan=plan,
                    academic_year=plan.academic_year
                )
                
    elif role == "teacher":
        profile = get_object_or_404(TeacherProfile, user=user)
        # Generate Employee ID & Teacher ID
        total_teachers = TeacherProfile.objects.exclude(employee_id="").count()
        seq = total_teachers + 1
        tch_username = f"TCH2026{seq:04d}"
        emp_id = f"EMP2026{seq:04d}"
        
        # Verify uniqueness
        while User.objects.filter(username=tch_username).exists():
            seq += 1
            tch_username = f"TCH2026{seq:04d}"
            emp_id = f"EMP2026{seq:04d}"
            
        user.username = tch_username
        profile.employee_id = emp_id
        profile.status = TeacherProfile.Status.ACTIVE
        profile.save()
        
    # Update User Status
    user.registration_status = 'approved'
    user.approved_at = timezone.now()
    user.approved_by = request.user
    user.save()
    
    # Create notification
    Notification.objects.create(
        recipient=user,
        title="Congratulations! Account Approved 🎉",
        message="Your school account has been approved by the administrator. You now have full access to your dashboard!"
    )
    
    messages.success(request, f"Registration for '{user.full_name}' approved successfully.")
    return redirect("admin_pending_registrations")

@login_required
def admin_reject_registration(request, role, user_id):
    if request.user.role != "admin":
        return redirect("dashboard_redirect")
        
    user = get_object_or_404(User, id=user_id)
    reason = request.POST.get("rejected_reason", "Application does not meet requirements.")
    
    user.registration_status = 'rejected'
    user.rejected_reason = reason
    user.save()
    
    messages.warning(request, f"Registration for '{user.full_name}' has been rejected.")
    return redirect("admin_pending_registrations")


def check_unique_field(request):
    email = request.GET.get('email')
    phone = request.GET.get('phone')
    exists = False
    
    if email:
        if User.objects.filter(email=email).exists():
            exists = True
    elif phone:
        if User.objects.filter(phone=phone).exists():
            exists = True
            
    return JsonResponse({'exists': exists})



