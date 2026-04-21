from rest_framework import serializers

from hospitals.serializers import HospitalPublicSerializer

from .models import BloodRequest, RequestResponse


class BloodRequestSerializer(serializers.ModelSerializer):
    hospital = HospitalPublicSerializer(read_only=True)
    response_count = serializers.IntegerField(source="responses.count", read_only=True)

    class Meta:
        model = BloodRequest
        fields = (
            "id", "hospital", "blood_group", "units_needed", "patient_name",
            "urgency", "status", "city", "notes", "needed_by",
            "response_count", "created_at", "updated_at",
        )
        read_only_fields = ("id", "hospital", "status", "created_at", "updated_at")


class BloodRequestStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodRequest
        fields = ("status",)


class RequestResponseSerializer(serializers.ModelSerializer):
    donor_name = serializers.SerializerMethodField()
    donor_phone = serializers.CharField(source="donor.phone", read_only=True)
    donor_blood_group = serializers.SerializerMethodField()

    class Meta:
        model = RequestResponse
        fields = ("id", "request", "donor", "donor_name", "donor_phone",
                  "donor_blood_group", "status", "message", "created_at")
        read_only_fields = ("id", "donor", "status", "created_at")

    def get_donor_name(self, obj):
        return obj.donor.get_full_name() or obj.donor.username

    def get_donor_blood_group(self, obj):
        profile = getattr(obj.donor, "donor_profile", None)
        return profile.blood_group if profile else None
