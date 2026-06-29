from django.db import models

class VerificationReport(models.Model):
    """Store the result of a data‑integrity audit.
    The raw markdown report is kept in `report_text`; additional JSON can be added later.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    report_text = models.TextField()

    def __str__(self):
        return f"VerificationReport {self.id} @ {self.created_at}"

class VerificationSetting(models.Model):
    """Global settings for the verification endpoint.
    Feel free to extend with more flags as needed.
    """
    enable_duplicate_check = models.BooleanField(default=True)
    enable_orphan_check = models.BooleanField(default=True)
    enable_invalid_fk_check = models.BooleanField(default=True)
    # Add other toggles here.

    def __str__(self):
        return "VerificationSetting"
