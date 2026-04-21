from django.db import models

from donors.models import BLOOD_GROUPS
from hospitals.models import Hospital


class InventoryItem(models.Model):
    hospital = models.ForeignKey(
        Hospital, on_delete=models.CASCADE, related_name="inventory"
    )
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    units = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("hospital", "blood_group")
        ordering = ["blood_group"]

    def __str__(self) -> str:
        return f"{self.hospital.name}: {self.blood_group} = {self.units}"
