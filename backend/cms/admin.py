from django.contrib import admin

from .models import ContactMessage, Course, Facility, GalleryItem, Inquiry, Page


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "is_published", "updated_at")
    list_filter = ("is_published",)
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "body", "slug")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "grade_range", "is_featured", "is_published")
    list_filter = ("is_featured", "is_published")
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "description")


@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ("title", "sort_order", "is_published")
    list_filter = ("is_published",)
    search_fields = ("title", "description")


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ("title", "is_featured", "is_published", "created_at")
    list_filter = ("is_featured", "is_published")
    search_fields = ("title", "caption")


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ("student_name", "guardian_name", "preferred_class", "phone", "status", "created_at")
    list_filter = ("status", "preferred_class", "created_at")
    search_fields = ("student_name", "guardian_name", "email", "phone")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "subject", "email", "phone", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("name", "email", "phone", "subject", "message")
