from django.db.models import Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, views
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsDonor, IsHospitalAdmin, IsPatientOrHospitalAdmin
from hospitals.models import Hospital

from .models import BloodRequest, RequestResponse
from .serializers import (
    BloodRequestSerializer,
    BloodRequestStatusSerializer,
    RequestResponseSerializer,
)


def _owns_request(user, req) -> bool:
    """A request 'belongs' to:
       - the hospital admin whose hospital matches req.hospital (if any), OR
       - the user who created it (patient, hospital admin, etc.)
    """
    if user.is_hospital_admin and req.hospital_id and req.hospital_id == user.hospital.id:
        return True
    if req.created_by_id and req.created_by_id == user.id:
        return True
    return False


class BloodRequestListCreateView(generics.ListCreateAPIView):
    """
    GET: any authenticated user sees requests.
      - donors: ?matching=1 filters to open requests matching their blood group + city.
      - patients/hospital admins: ?mine=1 filters to requests they created / own.
    POST: hospital admin or patient.
    """
    serializer_class = BloodRequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["blood_group", "city", "status", "urgency", "hospital"]

    def get_queryset(self):
        qs = BloodRequest.objects.select_related("hospital", "created_by").all()
        params = self.request.query_params
        user = self.request.user

        if params.get("matching") == "1" and user.is_donor:
            profile = getattr(user, "donor_profile", None)
            if profile:
                qs = qs.filter(
                    blood_group=profile.blood_group,
                    status=BloodRequest.Status.OPEN,
                )
                if user.city:
                    qs = qs.filter(Q(city__iexact=user.city) | Q(city=""))

        if params.get("mine") == "1":
            if user.is_hospital_admin:
                qs = qs.filter(Q(hospital=user.hospital) | Q(created_by=user))
            else:
                qs = qs.filter(created_by=user)

        return qs

    def create(self, request, *args, **kwargs):
        if not (request.user.is_hospital_admin or request.user.is_patient):
            return Response(
                {"detail": "Only hospital admins or patients can create requests."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        user = self.request.user
        city = serializer.validated_data.get("city")

        if user.is_hospital_admin:
            hospital = user.hospital
            serializer.save(
                hospital=hospital,
                created_by=user,
                city=city or hospital.city,
            )
            return

        # Patient flow — hospital_id is optional.
        hospital_id = serializer.validated_data.pop("hospital_id", None)
        hospital = None
        if hospital_id:
            hospital = get_object_or_404(Hospital, pk=hospital_id)
        serializer.save(
            hospital=hospital,
            created_by=user,
            city=city or user.city,
        )


class BloodRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BloodRequestSerializer
    permission_classes = [IsAuthenticated]
    queryset = BloodRequest.objects.all()

    def perform_update(self, serializer):
        req = self.get_object()
        if not _owns_request(self.request.user, req):
            raise PermissionDenied("Only the requester can modify this request.")
        serializer.save()

    def perform_destroy(self, instance):
        if not _owns_request(self.request.user, instance):
            raise PermissionDenied("Only the requester can delete this request.")
        instance.delete()


class BloodRequestStatusView(views.APIView):
    permission_classes = [IsPatientOrHospitalAdmin]

    def patch(self, request, pk):
        req = get_object_or_404(BloodRequest, pk=pk)
        if not _owns_request(request.user, req):
            return Response(
                {"detail": "Not your request."},
                status=status.HTTP_403_FORBIDDEN,
            )
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
            return Response(
                {"detail": "Request is no longer open."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        response, created = RequestResponse.objects.get_or_create(
            request=req, donor=request.user,
            defaults={"message": request.data.get("message", "")},
        )
        return Response(
            RequestResponseSerializer(response).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class RequestResponsesListView(generics.ListAPIView):
    """Hospital admin *or* patient requester sees who offered to help."""
    serializer_class = RequestResponseSerializer
    permission_classes = [IsPatientOrHospitalAdmin]

    def get_queryset(self):
        req_id = self.kwargs["pk"]
        req = get_object_or_404(BloodRequest, pk=req_id)
        if not _owns_request(self.request.user, req):
            raise PermissionDenied("Not your request.")
        return req.responses.select_related("donor", "donor__donor_profile").all()


class MyResponsesView(generics.ListAPIView):
    serializer_class = RequestResponseSerializer
    permission_classes = [IsDonor]

    def get_queryset(self):
        return RequestResponse.objects.filter(donor=self.request.user).select_related("request")
