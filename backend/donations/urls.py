from django.urls import path

from .views import HospitalDonationsView, MyDonationsView, RecordDonationView

urlpatterns = [
    path("record/", RecordDonationView.as_view(), name="donations-record"),
    path("mine/", MyDonationsView.as_view(), name="donations-mine"),
    path("hospital/", HospitalDonationsView.as_view(), name="donations-hospital"),
]
