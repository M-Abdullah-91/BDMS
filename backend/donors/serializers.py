from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import DonorProfile, LabReport


class DonorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    is_eligible = serializers.BooleanField(read_only=True)
    next_eligible_date = serializers.DateField(read_only=True)
    days_until_eligible = serializers.IntegerField(read_only=True)

    class Meta:
        model = DonorProfile
        fields = (
            "id", "user", "blood_group", "date_of_birth", "weight_kg",
            "is_verified", "verified_at", "available",
            "last_donation_date", "is_eligible", "next_eligible_date",
            "days_until_eligible", "created_at", "updated_at",
        )
        read_only_fields = ("id", "is_verified", "verified_at", "last_donation_date",
                            "created_at", "updated_at")


class PublicDonorSerializer(serializers.ModelSerializer):
    """Trimmed view for hospital search results — no sensitive identifiers."""
    full_name = serializers.SerializerMethodField()
    city = serializers.CharField(source="user.city", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = DonorProfile
        fields = ("id", "full_name", "blood_group", "city", "phone",
                  "is_eligible", "next_eligible_date", "last_donation_date", "is_verified")

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class LabReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabReport
        fields = ("id", "donor", "file", "note", "status",
                  "reviewed_by", "reviewed_at", "review_note", "uploaded_at")
        read_only_fields = ("id", "donor", "status", "reviewed_by", "reviewed_at",
                            "review_note", "uploaded_at")


class LabReportReviewSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=("approve", "reject"))
    review_note = serializers.CharField(required=False, allow_blank=True, max_length=255)
