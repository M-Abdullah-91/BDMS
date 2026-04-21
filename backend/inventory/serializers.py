from rest_framework import serializers

from .models import InventoryItem


class InventoryItemSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)
    hospital_city = serializers.CharField(source="hospital.city", read_only=True)

    class Meta:
        model = InventoryItem
        fields = ("id", "hospital", "hospital_name", "hospital_city",
                  "blood_group", "units", "updated_at")
        read_only_fields = ("id", "hospital", "updated_at")
