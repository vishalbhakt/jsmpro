from rest_framework import serializers

from .models import ContactMessage, Course, Facility, GalleryItem, Inquiry, Page


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = [
            "id",
            "slug",
            "title",
            "body",
            "meta_title",
            "meta_description",
            "is_published",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "grade_range",
            "image",
            "is_featured",
            "is_published",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = ["id", "title", "description", "icon", "image", "sort_order", "is_published"]


class GalleryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryItem
        fields = ["id", "title", "category", "image", "caption", "is_featured", "is_published", "created_at"]
        read_only_fields = ["created_at"]


class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = [
            "id",
            "student_name",
            "guardian_name",
            "email",
            "phone",
            "preferred_class",
            "message",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "subject",
            "message",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
