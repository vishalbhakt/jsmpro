from django.db import models


class ClassRoom(models.Model):
    name = models.CharField(max_length=80)
    section = models.CharField(max_length=20, blank=True)
    academic_year = models.CharField(max_length=20)
    capacity = models.PositiveIntegerField(default=40)
    class_teacher = models.ForeignKey(
        "users.TeacherProfile",
        on_delete=models.SET_NULL,
        related_name="classrooms",
        blank=True,
        null=True,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["name", "section", "academic_year"],
                name="unique_classroom_per_year",
            )
        ]
        ordering = ["name", "section"]

    def __str__(self):
        section = f" - {self.section}" if self.section else ""
        return f"{self.name}{section} ({self.academic_year})"


class Subject(models.Model):
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name="subjects")
    teacher = models.ForeignKey(
        "users.TeacherProfile",
        on_delete=models.SET_NULL,
        related_name="subjects",
        blank=True,
        null=True,
    )
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=30)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["classroom", "code"],
                name="unique_subject_code_per_classroom",
            )
        ]
        ordering = ["classroom__name", "name"]

    def __str__(self):
        return f"{self.name} - {self.classroom}"


class Assessment(models.Model):
    class Type(models.TextChoices):
        QUIZ = "quiz", "Quiz"
        TEST = "test", "Test"
        MIDTERM = "midterm", "Midterm"
        FINAL = "final", "Final"

    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name="assessments")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="assessments")
    title = models.CharField(max_length=160)
    assessment_type = models.CharField(max_length=20, choices=Type.choices, default=Type.TEST)
    max_marks = models.DecimalField(max_digits=6, decimal_places=2, default=100)
    scheduled_for = models.DateField(blank=True, null=True)
    created_by = models.ForeignKey(
        "users.TeacherProfile",
        on_delete=models.SET_NULL,
        related_name="assessments",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-scheduled_for", "title"]

    def __str__(self):
        return self.title


class Result(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name="results")
    student = models.ForeignKey("users.StudentProfile", on_delete=models.CASCADE, related_name="results")
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2)
    grade = models.CharField(max_length=8, blank=True)
    remarks = models.TextField(blank=True)
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["assessment", "student"],
                name="unique_result_per_assessment_student",
            )
        ]
        ordering = ["-created_at"]

    @property
    def total_marks(self):
        return self.assessment.max_marks if self.assessment else 100.0

    @property
    def percentage(self):
        max_m = float(self.total_marks)
        obtained = float(self.marks_obtained)
        if max_m > 0:
            return round((obtained / max_m) * 100, 2)
        return 0.0

    def save(self, *args, **kwargs):
        if not self.grade:
            max_marks = float(self.assessment.max_marks) if self.assessment and self.assessment.max_marks else 100.0
            obtained = float(self.marks_obtained)
            ratio = obtained / max_marks if max_marks > 0 else 0.0
            if ratio >= 0.9:
                self.grade = "A+"
            elif ratio >= 0.8:
                self.grade = "A"
            elif ratio >= 0.7:
                self.grade = "B"
            elif ratio >= 0.6:
                self.grade = "C"
            elif ratio >= 0.5:
                self.grade = "D"
            else:
                self.grade = "F"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student} - {self.assessment}"
