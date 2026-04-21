from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, views
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import SearchFilter
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from accounts.permissions import IsDonor, IsHospitalAdmin

from .models import DonorProfile, LabReport
from .serializers import (
    DonorProfileSerializer,
    LabReportReviewSerializer,
    LabReportSerializer,
    PublicDonorSerializer,
)


class MyDonorProfileView(generics.RetrieveUpdateAPIView):
    """Donor reads / updates their own profile (blood_group, city, weight, availability)."""
    serializer_class = DonorProfileSerializer
    permission_classes = [IsDonor]

    def get_object(self):
        profile, _ = DonorProfile.objects.get_or_create(
            user=self.request.user, defaults={"blood_group": "O+"}
        )
        return profile


class DonorSearchView(generics.ListAPIView):
    """Hospital admins search verified donors by blood group / city."""
    serializer_class = PublicDonorSerializer
    permission_classes = [IsHospitalAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["blood_group", "user__city", "available"]
    search_fields = ["user__username", "user__first_name", "user__last_name"]

    def get_queryset(self):
        return (
            DonorProfile.objects
            .select_related("user")
            .filter(is_verified=True)
            .order_by("-updated_at")
        )


class LabReportUploadView(generics.CreateAPIView):
    serializer_class = LabReportSerializer
    permission_classes = [IsDonor]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        profile, _ = DonorProfile.objects.get_or_create(
            user=self.request.user, defaults={"blood_group": "O+"}
        )
        serializer.save(donor=profile)


class MyLabReportsView(generics.ListAPIView):
    serializer_class = LabReportSerializer
    permission_classes = [IsDonor]

    def get_queryset(self):
        return LabReport.objects.filter(donor__user=self.request.user)


class PendingLabReportsView(generics.ListAPIView):
    """Hospital admins see all pending reports awaiting review."""
    serializer_class = LabReportSerializer
    permission_classes = [IsHospitalAdmin]

    def get_queryset(self):
        return LabReport.objects.filter(status=LabReport.Status.PENDING).select_related("donor__user")


class LabReportReviewView(views.APIView):
    """Approve or reject a lab report. Approving verifies the donor."""
    permission_classes = [IsHospitalAdmin]

    def post(self, request, pk):
        report = get_object_or_404(LabReport, pk=pk)
        serializer = LabReportReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data["action"]
        note = serializer.validated_data.get("review_note", "")

        if report.status != LabReport.Status.PENDING:
            return Response(
                {"detail": "Report already reviewed."}, status=status.HTTP_400_BAD_REQUEST
            )

        report.reviewed_by = request.user
        report.reviewed_at = timezone.now()
        report.review_note = note

        if action == "approve":
            report.status = LabReport.Status.APPROVED
            donor = report.donor
            donor.is_verified = True
            donor.verified_at = timezone.now()
            donor.verified_by = request.user
            donor.save(update_fields=["is_verified", "verified_at", "verified_by"])
        else:
            report.status = LabReport.Status.REJECTED

        report.save()
        return Response(LabReportSerializer(report).data)


class DonorEligibilityView(views.APIView):
    permission_classes = [IsDonor]

    def get(self, request):
        profile = getattr(request.user, "donor_profile", None)
        if profile is None:
            raise PermissionDenied("No donor profile for this user.")
        return Response({
            "is_verified": profile.is_verified,
            "is_eligible": profile.is_eligible,
            "available": profile.available,
            "last_donation_date": profile.last_donation_date,
            "next_eligible_date": profile.next_eligible_date,
            "days_until_eligible": profile.days_until_eligible,
        })
