from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsHospitalAdmin

from .models import InventoryItem
from .serializers import InventoryItemSerializer


class MyInventoryView(generics.ListCreateAPIView):
    """Hospital admin manages their own inventory."""
    serializer_class = InventoryItemSerializer
    permission_classes = [IsHospitalAdmin]

    def get_queryset(self):
        return InventoryItem.objects.filter(hospital=self.request.user.hospital)

    def perform_create(self, serializer):
        hospital = self.request.user.hospital
        blood_group = serializer.validated_data["blood_group"]
        if InventoryItem.objects.filter(hospital=hospital, blood_group=blood_group).exists():
            raise ValidationError(
                {"blood_group": "Inventory entry for this blood group already exists. Update it instead."}
            )
        serializer.save(hospital=hospital)


class MyInventoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InventoryItemSerializer
    permission_classes = [IsHospitalAdmin]

    def get_queryset(self):
        return InventoryItem.objects.filter(hospital=self.request.user.hospital)


class PublicInventoryView(generics.ListAPIView):
    """Anyone authenticated can browse inventory across hospitals (e.g. patients looking for stock)."""
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]
    queryset = InventoryItem.objects.select_related("hospital").all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["blood_group", "hospital__city", "hospital"]
