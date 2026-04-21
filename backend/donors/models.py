from datetime import date, timedelta

from django.conf import settings
from django.db import models


BLOOD_GROUPS = [
    ("A+", "A+"), ("A-", "A-"),
    ("B+", "B+"), ("B-", "B-"),
    ("AB+", "AB+"), ("AB-", "AB-"),
    ("O+", "O+"), ("O-", "O-"),
]

COOLDOWN_DAYS = 90


class DonorProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="donor_profile"
    )
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    date_of_birth = models.DateField(null=True, blank=True)
    weight_kg = models.PositiveIntegerField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="verified_donors",
        null=True, blank=True,
    )
    last_donation_date = models.DateField(null=True, blank=True)
    available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.user.username} — {self.blood_group}"

    @property
    def next_eligible_date(self):
        if not self.last_donation_date:
            return date.today()
        return self.last_donation_date + timedelta(days=COOLDOWN_DAYS)

    @property
    def is_eligible(self) -> bool:
        if not self.is_verified or not self.available:
            return False
        return date.today() >= self.next_eligible_date

    @property
    def days_until_eligible(self) -> int:
        delta = (self.next_eligible_date - date.today()).days
        return max(delta, 0)


def lab_report_path(instance, filename):
    return f"lab_reports/donor_{instance.donor.user_id}/{filename}"


class LabReport(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    donor = models.ForeignKey(
        DonorProfile, on_delete=models.CASCADE, related_name="lab_reports"
    )
    file = models.FileField(upload_to=lab_report_path)
    note = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="reviewed_reports",
        null=True, blank=True,
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_note = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self) -> str:
        return f"LabReport<{self.donor.user.username}:{self.status}>"
