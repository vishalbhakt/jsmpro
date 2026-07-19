from django.urls import path
from . import views

urlpatterns = [
    # Public Website Views
    path("", views.home_view, name="home"),
    # Mapped views
    path("about/", views.about_view, name="about"),
    path("academics/", views.academics_view, name="academics"),
    path("courses/", views.courses_view, name="courses"),
    path("admission/", views.admission_view, name="admission"),
    path("facilities/", views.facilities_view, name="facilities"),
    path("gallery/", views.gallery_view, name="gallery"),
    path("contact/", views.contact_view, name="contact"),
    
    # Auth Views
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("dashboard/redirect/", views.dashboard_redirect, name="dashboard_redirect"),
    path("dashboard/profile/", views.my_profile, name="my_profile"),
    path("dashboard/profile/complete/", views.profile_complete_wizard, name="profile_complete_wizard"),

    # Student Portal Views
    path("dashboard/student/", views.student_overview, name="student_overview"),
    path("dashboard/student/assignments/", views.student_assignments, name="student_assignments"),
    path("dashboard/student/learning/", views.student_learning, name="student_learning"),
    path("dashboard/student/attendance/", views.student_attendance, name="student_attendance"),
    path("dashboard/student/results/", views.student_results, name="student_results"),
    path("dashboard/student/payments/", views.student_payments, name="student_payments"),
    path("dashboard/student/learning/note/access/<int:note_id>/", views.student_note_access, name="student_note_access"),
    path("dashboard/student/learning/video/access/<int:video_id>/", views.student_video_access, name="student_video_access"),


    # Teacher Portal Views
    path("dashboard/teacher/", views.teacher_overview, name="teacher_overview"),
    path("dashboard/teacher/students/", views.teacher_students, name="teacher_students"),
    path("dashboard/teacher/attendance/", views.teacher_attendance, name="teacher_attendance"),
    path("dashboard/teacher/assignments/", views.teacher_assignments, name="teacher_assignments"),
    path("dashboard/teacher/assignments/delete/<int:assignment_id>/", views.teacher_delete_assignment, name="teacher_delete_assignment"),
    path("dashboard/teacher/assignments/grade/<int:submission_id>/", views.teacher_grade_submission, name="teacher_grade_submission"),
    path("dashboard/teacher/learning/", views.teacher_learning, name="teacher_learning"),
    path("dashboard/teacher/learning/upload-note/", views.teacher_upload_note, name="teacher_upload_note"),
    path("dashboard/teacher/learning/upload-video/", views.teacher_upload_video, name="teacher_upload_video"),
    path("dashboard/teacher/learning/delete-note/<int:note_id>/", views.teacher_delete_note, name="teacher_delete_note"),
    path("dashboard/teacher/learning/delete-video/<int:video_id>/", views.teacher_delete_video, name="teacher_delete_video"),
    path("dashboard/teacher/results/", views.teacher_results, name="teacher_results"),
    path("dashboard/teacher/results/delete/<int:result_id>/", views.teacher_delete_result, name="teacher_delete_result"),


    # Admin Portal Views
    path("dashboard/admin/", views.admin_overview, name="admin_overview"),
    path("dashboard/admin/users/", views.admin_users, name="admin_users"),
    path("dashboard/admin/users/create/", views.admin_user_create, name="admin_user_create"),
    path("dashboard/admin/users/edit/<int:user_id>/", views.admin_user_edit, name="admin_user_edit"),
    path("dashboard/admin/users/delete/<int:user_id>/", views.admin_user_delete, name="admin_user_delete"),
    path("dashboard/admin/students/", views.admin_students, name="admin_students"),
    path("dashboard/admin/teachers/", views.admin_teachers, name="admin_teachers"),
    path("dashboard/admin/classes/", views.admin_classes, name="admin_classes"),
    path("dashboard/admin/classes/edit/<int:class_id>/", views.admin_class_edit, name="admin_class_edit"),
    path("dashboard/admin/classes/delete/<int:class_id>/", views.admin_class_delete, name="admin_class_delete"),
    path("dashboard/admin/subjects/", views.admin_subjects, name="admin_subjects"),
    path("dashboard/admin/payments/", views.admin_payments, name="admin_payments"),
    path("dashboard/admin/courses/", views.admin_courses, name="admin_courses"),
    path("dashboard/admin/courses/edit/<int:course_id>/", views.admin_course_edit, name="admin_course_edit"),
    path("dashboard/admin/courses/delete/<int:course_id>/", views.admin_course_delete, name="admin_course_delete"),
    
    path("dashboard/admin/facilities/", views.admin_facilities, name="admin_facilities"),
    path("dashboard/admin/facilities/edit/<int:facility_id>/", views.admin_facility_edit, name="admin_facility_edit"),
    path("dashboard/admin/facilities/delete/<int:facility_id>/", views.admin_facility_delete, name="admin_facility_delete"),
    
    path("dashboard/admin/gallery/", views.admin_gallery, name="admin_gallery"),
    path("dashboard/admin/gallery/edit/<int:item_id>/", views.admin_gallery_edit, name="admin_gallery_edit"),
    path("dashboard/admin/gallery/delete/<int:item_id>/", views.admin_gallery_delete, name="admin_gallery_delete"),
    
    path("dashboard/admin/contact-messages/", views.admin_contact_messages, name="admin_contact_messages"),
    path("dashboard/admin/contact-messages/update-status/<int:msg_id>/", views.admin_contact_message_status, name="admin_contact_message_status"),
    path("dashboard/admin/contact-messages/delete/<int:msg_id>/", views.admin_contact_message_delete, name="admin_contact_message_delete"),
    
    path("dashboard/admin/inquiries/", views.admin_inquiries, name="admin_inquiries"),
    path("dashboard/admin/inquiries/update-status/<int:inq_id>/", views.admin_inquiry_status, name="admin_inquiry_status"),
    path("dashboard/admin/inquiries/delete/<int:inq_id>/", views.admin_inquiry_delete, name="admin_inquiry_delete"),
    
    path("dashboard/admin/subjects/edit/<int:subject_id>/", views.admin_subject_edit, name="admin_subject_edit"),
    path("dashboard/admin/subjects/delete/<int:subject_id>/", views.admin_subject_delete, name="admin_subject_delete"),
    path("dashboard/admin/assessments/", views.admin_assessments, name="admin_assessments"),
    path("dashboard/admin/results/", views.admin_results, name="admin_results"),
    
    path("dashboard/admin/attendance-sessions/", views.admin_attendance_sessions, name="admin_attendance_sessions"),
    path("dashboard/admin/attendance-records/", views.admin_attendance_records, name="admin_attendance_records"),
    
    path("dashboard/admin/assignments/", views.admin_assignments, name="admin_assignments"),
    path("dashboard/admin/assignments/delete/<int:assignment_id>/", views.admin_assignments_delete, name="admin_assignments_delete"),
    path("dashboard/admin/submissions/", views.admin_submissions, name="admin_submissions"),
    path("dashboard/admin/notes/", views.admin_notes, name="admin_notes"),
    path("dashboard/admin/notes/delete/<int:note_id>/", views.admin_notes_delete, name="admin_notes_delete"),
    path("dashboard/admin/videos/", views.admin_videos, name="admin_videos"),
    path("dashboard/admin/videos/delete/<int:video_id>/", views.admin_videos_delete, name="admin_videos_delete"),
    path("dashboard/admin/quizzes/", views.admin_quizzes, name="admin_quizzes"),
    path("dashboard/admin/quizzes/delete/<int:quiz_id>/", views.admin_quizzes_delete, name="admin_quizzes_delete"),
    
    path("dashboard/admin/fee-plans/", views.admin_fee_plans, name="admin_fee_plans"),
    path("dashboard/admin/fee-plans/edit/<int:plan_id>/", views.admin_fee_plans_edit, name="admin_fee_plans_edit"),
    path("dashboard/admin/fee-plans/delete/<int:plan_id>/", views.admin_fee_plans_delete, name="admin_fee_plans_delete"),
    path("dashboard/admin/fee-plans/duplicate/<int:plan_id>/", views.admin_fee_plans_duplicate, name="admin_fee_plans_duplicate"),
    path("dashboard/admin/fee-plans/toggle/<int:plan_id>/", views.admin_fee_plans_toggle_active, name="admin_fee_plans_toggle_active"),
    path("dashboard/admin/fee-plans/bulk/", views.admin_fee_plans_bulk, name="admin_fee_plans_bulk"),
    
    path("dashboard/admin/payments/history/<int:student_id>/", views.admin_payment_history, name="admin_payment_history"),
    path("dashboard/admin/payments/receipt/<int:payment_id>/pdf/", views.admin_receipt_pdf, name="admin_receipt_pdf"),
    path("dashboard/admin/payments/edit/<int:payment_id>/", views.admin_payment_edit, name="admin_payment_edit"),
    path("dashboard/admin/payments/delete/<int:payment_id>/", views.admin_payment_delete, name="admin_payment_delete"),
    path("dashboard/admin/payments/approve/<int:payment_id>/", views.admin_approve_payment, name="admin_approve_payment"),
    path("dashboard/admin/payments/update-adjustments/<int:fee_id>/", views.admin_update_fee_adjustments, name="admin_update_fee_adjustments"),
    path("dashboard/admin/payments/reports/", views.admin_finance_reports, name="admin_finance_reports"),
    
    path("dashboard/student/payments/pay/<int:fee_id>/", views.student_pay_now, name="student_pay_now"),
    
    path("dashboard/admin/announcements/", views.admin_announcements, name="admin_announcements"),
    path("dashboard/admin/announcements/delete/<int:ann_id>/", views.admin_announcements_delete, name="admin_announcements_delete"),
    path("dashboard/admin/notifications/", views.admin_notifications, name="admin_notifications"),
    path("dashboard/admin/notifications/delete/<int:notif_id>/", views.admin_notifications_delete, name="admin_notifications_delete"),
    
    path("dashboard/admin/profile/", views.admin_profile_redirect, name="admin_profile_redirect"),
    path("dashboard/admin/id-cards/", views.admin_id_cards, name="admin_id_cards"),
    path("dashboard/admin/id-cards/view/<str:role>/<int:profile_id>/", views.admin_id_card_view, name="admin_id_card_view"),
    path("dashboard/admin/id-cards/print/<str:role>/<int:profile_id>/", views.admin_id_card_print, name="admin_id_card_print"),
    path("verify/id/<str:verification_code>/", views.verify_id_card, name="verify_id_card"),
    
    path("register/student/", views.student_register, name="student_register"),
    path("register/teacher/", views.teacher_register, name="teacher_register"),
    path("register/check-unique/", views.check_unique_field, name="check_unique_field"),
    path("dashboard/admin/teachers/assign/<int:teacher_id>/", views.admin_teacher_assign, name="admin_teacher_assign"),
    path("dashboard/admin/pending-registrations/", views.admin_pending_registrations, name="admin_pending_registrations"),
    path("dashboard/admin/pending-registrations/approve/<str:role>/<int:user_id>/", views.admin_approve_registration, name="admin_approve_registration"),
    path("dashboard/admin/pending-registrations/reject/<str:role>/<int:user_id>/", views.admin_reject_registration, name="admin_reject_registration"),
]
