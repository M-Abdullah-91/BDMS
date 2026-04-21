from django.db import models

from donors.models import BLOOD_GROUPS, DonorProfile
from hospitals.models import Hospital
from requests_app.models import BloodRequest


class Donation(models.Model):
    donor = models.ForeignKey(
        DonorProfile, on_delete=models.CASCADE, related_name="donations"
    )
    hospital = models.ForeignKey(
        Hospital, on_delete=models.CASCADE, related_name="donations"
    )
    related_request = models.ForeignKey(
        BloodRequest, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="donations",
    )
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    units = models.PositiveIntegerField(default=1)
    donation_date = models.DateField()
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-donation_date"]

    def __str__(self) -> str:
        return f"{self.donor.user.username} → {self.hospital.name} ({self.donation_date})"
