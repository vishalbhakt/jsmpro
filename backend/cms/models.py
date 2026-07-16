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
    code = models.CharField(max_length=30, blank=True)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    grade_range = models.CharField(max_length=80)
    duration = models.CharField(max_length=80, blank=True)
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

    def clean(self):
        super().clean()
        from django.core.exceptions import ValidationError
        import re

        # Minimum length validations
        if self.title and len(self.title.strip()) < 5:
            raise ValidationError({"title": "Facility title must be at least 5 characters long."})
        if self.description and len(self.description.strip()) < 10:
            raise ValidationError({"description": "Description must be at least 10 characters long."})

        # URL validation
        if self.title:
            title_stripped = self.title.strip()
            url_pattern = re.compile(
                r'^(?:http|ftp)s?://'
                r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'
                r'localhost|'
                r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
                r'(?::\d+)?'
                r'(?:/?|[/?]\S+)$', re.IGNORECASE)
            if re.search(r'https?://|www\.', title_stripped, re.IGNORECASE) or url_pattern.match(title_stripped):
                raise ValidationError({"title": "URLs are not allowed in the facility title."})

            # Junk text validation (e.g. no vowels)
            if not any(char in 'aeiouAEIOU' for char in title_stripped) and len(title_stripped) > 4:
                raise ValidationError({"title": "Please enter a valid title. Junk text detected."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class GalleryItem(models.Model):
    title = models.CharField(max_length=160)
    category = models.CharField(max_length=60, default="events")
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

    user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='inquiries'
    )
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
