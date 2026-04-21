from rest_framework import serializers

from hospitals.serializers import HospitalPublicSerializer

from .models import BloodRequest, RequestResponse


class BloodRequestSerializer(serializers.ModelSerializer):
    hospital = HospitalPublicSerializer(read_only=True)
    hospital_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True,
        help_text="Optional — patients can supply this to associate the request with a hospital.",
    )
    response_count = serializers.IntegerField(source="responses.count", read_only=True)
    requester_role = serializers.SerializerMethodField()
    requester_name = serializers.SerializerMethodField()
    requester_phone = serializers.SerializerMethodField()

    class Meta:
        model = BloodRequest
        fields = (
            "id", "hospital", "hospital_id", "blood_group", "units_needed",
            "patient_name", "urgency", "status", "city", "notes", "needed_by",
            "response_count", "requester_role", "requester_name", "requester_phone",
            "created_at", "updated_at",
        )
        read_only_fields = (
            "id", "hospital", "status", "created_at", "updated_at",
            "requester_role", "requester_name", "requester_phone",
        )

    def get_requester_role(self, obj):
        return obj.created_by.role if obj.created_by_id else None

    def get_requester_name(self, obj):
        if not obj.created_by_id:
            return None
        u = obj.created_by
        return u.get_full_name() or u.username

    def get_requester_phone(self, obj):
        return obj.created_by.phone if obj.created_by_id else None


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
