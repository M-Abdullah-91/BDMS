from rest_framework import serializers

from .models import Donation


class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.SerializerMethodField()
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)

    class Meta:
        model = Donation
        fields = ("id", "donor", "donor_name", "hospital", "hospital_name",
                  "related_request", "blood_group", "units", "donation_date",
                  "notes", "created_at")
        read_only_fields = ("id", "hospital", "hospital_name", "donor_name", "created_at")

    def get_donor_name(self, obj):
        return obj.donor.user.get_full_name() or obj.donor.user.username


class RecordDonationSerializer(serializers.Serializer):
    donor_id = serializers.IntegerField()
    blood_group = serializers.CharField(max_length=3)
    units = serializers.IntegerField(min_value=1, default=1)
    donation_date = serializers.DateField()
    related_request = serializers.IntegerField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=255)
