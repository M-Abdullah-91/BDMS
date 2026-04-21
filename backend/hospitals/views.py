from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsHospitalAdmin

from .models import Hospital
from .serializers import HospitalPublicSerializer, HospitalSerializer


class MyHospitalView(generics.RetrieveUpdateAPIView):
    serializer_class = HospitalSerializer
    permission_classes = [IsHospitalAdmin]

    def get_object(self):
        return self.request.user.hospital


class HospitalListView(generics.ListAPIView):
    """Any authenticated user can browse hospitals (e.g. donors choosing where to donate)."""
    serializer_class = HospitalPublicSerializer
    permission_classes = [IsAuthenticated]
    queryset = Hospital.objects.all().order_by("name")
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["city"]
    search_fields = ["name", "city"]
