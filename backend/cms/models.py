from django.db import models


class Page(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=180)
    body = models.TextField()
    meta_title = models.CharField(max_length=180, blank=True)
    meta_description = models.CharField(max_length=255, blank=True)
    is_published = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["slug"]

    def __str__(self):
        return self.title


class Course(models.Model):
    title = models.CharField(max_length=160)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    grade_range = models.CharField(max_length=80)
    image = models.ImageField(upload_to="courses/", blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class Facility(models.Model):
    title = models.CharField(max_length=160)
    description = models.TextField()
    icon = models.CharField(max_length=60, blank=True)
    image = models.ImageField(upload_to="facilities/", blank=True, null=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "title"]

    def __str__(self):
        return self.title


class GalleryItem(models.Model):
    title = models.CharField(max_length=160)
    image = models.ImageField(upload_to="gallery/")
    caption = models.CharField(max_length=255, blank=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Inquiry(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        ADMITTED = "admitted", "Admitted"
        CLOSED = "closed", "Closed"

    student_name = models.CharField(max_length=140)
    guardian_name = models.CharField(max_length=140)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    preferred_class = models.CharField(max_length=80)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student_name} - {self.preferred_class}"


class ContactMessage(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        IN_PROGRESS = "in_progress", "In progress"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"

    name = models.CharField(max_length=140)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=160)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.subject}"
