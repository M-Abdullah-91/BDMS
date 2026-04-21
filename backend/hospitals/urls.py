from django.urls import path

from .views import HospitalListView, MyHospitalView

urlpatterns = [
    path("", HospitalListView.as_view(), name="hospitals-list"),
    path("me/", MyHospitalView.as_view(), name="hospital-me"),
]
