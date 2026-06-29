from rest_framework import permissions, viewsets

from users.permissions import is_admin

from .models import ContactMessage, Course, Facility, GalleryItem, Inquiry, Page
from .serializers import (
    ContactMessageSerializer,
    CourseSerializer,
    FacilitySerializer,
    GalleryItemSerializer,
    InquirySerializer,
    PageSerializer,
)


class IsAdminOrPublicRead(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_admin(request.user)


class PublicCMSViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrPublicRead]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "title", "sort_order"]

    def get_queryset(self):
        qs = self.queryset
        if self.request.method in permissions.SAFE_METHODS and not is_admin(self.request.user):
            return qs.filter(is_published=True)
        return qs


class PageViewSet(PublicCMSViewSet):
    serializer_class = PageSerializer
    queryset = Page.objects.all()
    lookup_field = "slug"
    search_fields = ["title", "body", "slug"]


class CourseViewSet(PublicCMSViewSet):
    serializer_class = CourseSerializer
    queryset = Course.objects.all()


class FacilityViewSet(PublicCMSViewSet):
    serializer_class = FacilitySerializer
    queryset = Facility.objects.all()


class GalleryItemViewSet(PublicCMSViewSet):
    serializer_class = GalleryItemSerializer
    queryset = GalleryItem.objects.all()


class InquiryViewSet(viewsets.ModelViewSet):
    serializer_class = InquirySerializer
    queryset = Inquiry.objects.all()
    search_fields = ["student_name", "guardian_name", "email", "phone", "preferred_class", "status"]
    ordering_fields = ["created_at", "status"]

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [IsAdminOrPublicRead()]

    def get_queryset(self):
        if is_admin(self.request.user):
            return Inquiry.objects.all()
        return Inquiry.objects.none()


class ContactMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ContactMessageSerializer
    queryset = ContactMessage.objects.all()
    search_fields = ["name", "email", "phone", "subject", "status"]
    ordering_fields = ["created_at", "status", "subject"]

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [IsAdminOrPublicRead()]

    def get_queryset(self):
        if is_admin(self.request.user):
            return ContactMessage.objects.all()
        return ContactMessage.objects.none()
