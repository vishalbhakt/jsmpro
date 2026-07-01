from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from academics.views import AssessmentViewSet, ClassRoomViewSet, ResultViewSet, SubjectViewSet
from attendance.views import AttendanceRecordViewSet, AttendanceSessionViewSet
from cms.views import ContactMessageViewSet, CourseViewSet, FacilityViewSet, GalleryItemViewSet, InquiryViewSet, PageViewSet
from communication.views import AnnouncementViewSet, ActivityLogViewSet, NotificationViewSet
from verification.views import VerificationReportViewSet, VerificationSettingViewSet
from finance.views import FeePlanViewSet, PaymentViewSet, StudentLedgerAPIView
from learning.views import AssignmentSubmissionViewSet, AssignmentViewSet, NoteViewSet, QuizViewSet, VideoLectureViewSet
from users.views import (
    ChangePasswordView,
    CurrentUserView,
    DashboardStatsView,
    PublicStatsView,
    RegisterView,
    StudentProfileViewSet,
    TeacherProfileViewSet,
    TokenPairView,
    UserViewSet,
)

router = DefaultRouter()
router.register("users", UserViewSet, basename="users")
router.register("students", StudentProfileViewSet, basename="students")
router.register("teachers", TeacherProfileViewSet, basename="teachers")
router.register("classes", ClassRoomViewSet, basename="classes")
router.register("subjects", SubjectViewSet, basename="subjects")
router.register("assessments", AssessmentViewSet, basename="assessments")
router.register("attendance-sessions", AttendanceSessionViewSet, basename="attendance-sessions")
router.register("attendance-records", AttendanceRecordViewSet, basename="attendance-records")
router.register("assignments", AssignmentViewSet, basename="assignments")
router.register("submissions", AssignmentSubmissionViewSet, basename="submissions")
router.register("notes", NoteViewSet, basename="notes")
router.register("videos", VideoLectureViewSet, basename="videos")
router.register("quizzes", QuizViewSet, basename="quizzes")
router.register("results", ResultViewSet, basename="results")
router.register("fee-plans", FeePlanViewSet, basename="fee-plans")
router.register("payments", PaymentViewSet, basename="payments")
router.register("announcements", AnnouncementViewSet, basename="announcements")
router.register("notifications", NotificationViewSet, basename="notifications")
router.register('verification', VerificationReportViewSet, basename='verification')
router.register('verification-settings', VerificationSettingViewSet, basename='verification-settings')
router.register("activity-logs", ActivityLogViewSet, basename="activity-logs")
router.register("pages", PageViewSet, basename="pages")
router.register("courses", CourseViewSet, basename="courses")
router.register("facilities", FacilityViewSet, basename="facilities")
router.register("gallery", GalleryItemViewSet, basename="gallery")
router.register("inquiries", InquiryViewSet, basename="inquiries")
router.register("contact-messages", ContactMessageViewSet, basename="contact-messages")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/token/", TokenPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/me/", CurrentUserView.as_view(), name="current_user"),
    path("api/auth/change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("api/dashboard/", DashboardStatsView.as_view(), name="dashboard_stats"),
    path("api/public-stats/", PublicStatsView.as_view(), name="public_stats"),
    path("api/finance/student-ledger/<int:student_id>/", StudentLedgerAPIView.as_view(), name="api_student_ledger"),
    path("api/", include(router.urls)),
    path("", include("dashboard.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
