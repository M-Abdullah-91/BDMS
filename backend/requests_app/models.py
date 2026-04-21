from django.conf import settings
from django.db import models

from donors.models import BLOOD_GROUPS
from hospitals.models import Hospital


class BloodRequest(models.Model):
    class Urgency(models.TextChoices):
        LOW = "low", "Low"
        NORMAL = "normal", "Normal"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        FULFILLED = "fulfilled", "Fulfilled"
        CANCELLED = "cancelled", "Cancelled"

    hospital = models.ForeignKey(
        Hospital, on_delete=models.CASCADE, related_name="blood_requests",
        null=True, blank=True,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="created_requests",
    )
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    units_needed = models.PositiveIntegerField()
    patient_name = models.CharField(max_length=120)
    urgency = models.CharField(max_length=10, choices=Urgency.choices, default=Urgency.NORMAL)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)
    city = models.CharField(max_length=80, blank=True)
    notes = models.TextField(blank=True)
    needed_by = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.hospital.name} needs {self.units_needed}× {self.blood_group} ({self.status})"


class RequestResponse(models.Model):
    class Status(models.TextChoices):
        OFFERED = "offered", "Offered"
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"

    request = models.ForeignKey(
        BloodRequest, on_delete=models.CASCADE, related_name="responses"
    )
    donor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="request_responses"
    )
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OFFERED)
    message = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("request", "donor")
        ordering = ["-created_at"]
