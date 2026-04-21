from django.db.models import Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsDonor, IsHospitalAdmin

from .models import BloodRequest, RequestResponse
from .serializers import (
    BloodRequestSerializer,
    BloodRequestStatusSerializer,
    RequestResponseSerializer,
)


class BloodRequestListCreateView(generics.ListCreateAPIView):
    """
    GET: any authenticated user sees open requests (donors can filter to matching ones).
    POST: hospital admin only — creates a request for their hospital.
    """
    serializer_class = BloodRequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["blood_group", "city", "status", "urgency", "hospital"]

    def get_queryset(self):
        qs = BloodRequest.objects.select_related("hospital").all()
        if self.request.query_params.get("matching") == "1" and self.request.user.is_donor:
            profile = getattr(self.request.user, "donor_profile", None)
            if profile:
                qs = qs.filter(blood_group=profile.blood_group, status=BloodRequest.Status.OPEN)
                if self.request.user.city:
                    qs = qs.filter(Q(city__iexact=self.request.user.city) | Q(city=""))
        return qs

    def create(self, request, *args, **kwargs):
        if not request.user.is_hospital_admin:
            return Response({"detail": "Only hospital admins can create requests."},
                            status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        hospital = self.request.user.hospital
        serializer.save(
            hospital=hospital,
            created_by=self.request.user,
            city=serializer.validated_data.get("city") or hospital.city,
        )


class BloodRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BloodRequestSerializer
    permission_classes = [IsAuthenticated]
    queryset = BloodRequest.objects.all()

    def perform_update(self, serializer):
        req = self.get_object()
        if not self.request.user.is_hospital_admin or req.hospital_id != self.request.user.hospital.id:
            self.permission_denied(self.request, "Only the owning hospital can modify this request.")
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.is_hospital_admin or instance.hospital_id != self.request.user.hospital.id:
            self.permission_denied(self.request, "Only the owning hospital can delete this request.")
        instance.delete()


class BloodRequestStatusView(views.APIView):
    permission_classes = [IsHospitalAdmin]

    def patch(self, request, pk):
        req = get_object_or_404(BloodRequest, pk=pk)
        if req.hospital_id != request.user.hospital.id:
            return Response({"detail": "Not your hospital's request."}, status=status.HTTP_403_FORBIDDEN)
        serializer = BloodRequestStatusSerializer(req, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(BloodRequestSerializer(req).data)


class RespondToRequestView(views.APIView):
    """Donor offers to fulfill a request."""
    permission_classes = [IsDonor]

    def post(self, request, pk):
        req = get_object_or_404(BloodRequest, pk=pk)
        if req.status != BloodRequest.Status.OPEN:
            return Response({"detail": "Request is no longer open."}, status=status.HTTP_400_BAD_REQUEST)
        response, created = RequestResponse.objects.get_or_create(
            request=req, donor=request.user,
            defaults={"message": request.data.get("message", "")},
        )
        return Response(
            RequestResponseSerializer(response).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class RequestResponsesListView(generics.ListAPIView):
    """Hospital admin views responders for their request."""
    serializer_class = RequestResponseSerializer
    permission_classes = [IsHospitalAdmin]

    def get_queryset(self):
        req_id = self.kwargs["pk"]
        req = get_object_or_404(BloodRequest, pk=req_id)
        if req.hospital_id != self.request.user.hospital.id:
            self.permission_denied(self.request, "Not your hospital's request.")
        return req.responses.select_related("donor", "donor__donor_profile").all()


class MyResponsesView(generics.ListAPIView):
    serializer_class = RequestResponseSerializer
    permission_classes = [IsDonor]

    def get_queryset(self):
        return RequestResponse.objects.filter(donor=self.request.user).select_related("request")
