from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "role", "phone", "city")
        read_only_fields = ("id", "role")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    # Donor-only optional fields
    blood_group = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    # Hospital-admin-only optional fields
    hospital_name = serializers.CharField(required=False, allow_blank=True)
    hospital_address = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = (
            "username", "email", "password", "first_name", "last_name",
            "role", "phone", "city",
            "blood_group", "date_of_birth",
            "hospital_name", "hospital_address",
        )

    def validate_role(self, value):
        if value not in (User.Role.DONOR, User.Role.HOSPITAL_ADMIN):
            raise serializers.ValidationError("Role must be 'donor' or 'hospital_admin'.")
        return value

    def validate(self, attrs):
        role = attrs.get("role")
        if role == User.Role.DONOR and not attrs.get("blood_group"):
            raise serializers.ValidationError({"blood_group": "Required for donors."})
        if role == User.Role.HOSPITAL_ADMIN and not attrs.get("hospital_name"):
            raise serializers.ValidationError({"hospital_name": "Required for hospital admins."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        from donors.models import DonorProfile
        from hospitals.models import Hospital

        blood_group = validated_data.pop("blood_group", "")
        date_of_birth = validated_data.pop("date_of_birth", None)
        hospital_name = validated_data.pop("hospital_name", "")
        hospital_address = validated_data.pop("hospital_address", "")
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.role == User.Role.DONOR:
            DonorProfile.objects.create(
                user=user,
                blood_group=blood_group.upper(),
                date_of_birth=date_of_birth,
            )
        elif user.role == User.Role.HOSPITAL_ADMIN:
            Hospital.objects.create(
                admin=user,
                name=hospital_name,
                address=hospital_address,
                city=user.city,
                phone=user.phone,
            )
        return user
