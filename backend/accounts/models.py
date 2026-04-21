from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        DONOR = "donor", "Donor"
        HOSPITAL_ADMIN = "hospital_admin", "Hospital Admin"
        PATIENT = "patient", "Patient"
        SYSTEM_ADMIN = "system_admin", "System Admin"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.DONOR)
    phone = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=80, blank=True)

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"

    @property
    def is_donor(self) -> bool:
        return self.role == self.Role.DONOR

    @property
    def is_hospital_admin(self) -> bool:
        return self.role == self.Role.HOSPITAL_ADMIN

    @property
    def is_patient(self) -> bool:
        return self.role == self.Role.PATIENT
