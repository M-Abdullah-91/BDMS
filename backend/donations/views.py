from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, views
from rest_framework.response import Response

from accounts.permissions import IsDonor, IsHospitalAdmin
from donors.models import DonorProfile
from inventory.models import InventoryItem
from requests_app.models import BloodRequest

from .models import Donation
from .serializers import DonationSerializer, RecordDonationSerializer


class RecordDonationView(views.APIView):
    """Hospital admin records a donation. This:
      - creates a Donation row
      - updates the donor's last_donation_date (triggering the 90-day cooldown)
      - increments that hospital's inventory for the blood group
      - optionally links to a BloodRequest and marks it fulfilled if fully supplied
    """
    permission_classes = [IsHospitalAdmin]

    @transaction.atomic
    def post(self, request):
        serializer = RecordDonationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        donor = get_object_or_404(DonorProfile, pk=data["donor_id"])
        if not donor.is_verified:
            return Response(
                {"detail": "Donor is not verified yet."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not donor.is_eligible:
            return Response(
                {"detail": f"Donor is not eligible until {donor.next_eligible_date}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        related_request = None
        if data.get("related_request"):
            related_request = get_object_or_404(BloodRequest, pk=data["related_request"])
            if related_request.hospital_id != request.user.hospital.id:
                return Response(
                    {"detail": "Request belongs to another hospital."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        donation = Donation.objects.create(
            donor=donor,
            hospital=request.user.hospital,
            related_request=related_request,
            blood_group=data["blood_group"].upper(),
            units=data["units"],
            donation_date=data["donation_date"],
            notes=data.get("notes", ""),
        )

        # Trigger cooldown
        donor.last_donation_date = data["donation_date"]
        donor.save(update_fields=["last_donation_date"])

        # Update inventory
        item, _ = InventoryItem.objects.get_or_create(
            hospital=request.user.hospital,
            blood_group=donation.blood_group,
            defaults={"units": 0},
        )
        item.units += donation.units
        item.save(update_fields=["units"])

        # Fulfill request if enough units collected
        if related_request and related_request.status == BloodRequest.Status.OPEN:
            total = sum(d.units for d in related_request.donations.all())
            if total >= related_request.units_needed:
                related_request.status = BloodRequest.Status.FULFILLED
                related_request.save(update_fields=["status"])

        return Response(DonationSerializer(donation).data, status=status.HTTP_201_CREATED)


class MyDonationsView(generics.ListAPIView):
    serializer_class = DonationSerializer
    permission_classes = [IsDonor]

    def get_queryset(self):
        return Donation.objects.filter(donor__user=self.request.user).select_related("hospital")


class HospitalDonationsView(generics.ListAPIView):
    serializer_class = DonationSerializer
    permission_classes = [IsHospitalAdmin]

    def get_queryset(self):
        return Donation.objects.filter(hospital=self.request.user.hospital).select_related(
            "donor__user"
        )
