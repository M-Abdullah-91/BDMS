from django.urls import path

from .views import (
    DonorEligibilityView,
    DonorSearchView,
    LabReportReviewView,
    LabReportUploadView,
    MyDonorProfileView,
    MyLabReportsView,
    PendingLabReportsView,
)

urlpatterns = [
    path("me/", MyDonorProfileView.as_view(), name="donor-me"),
    path("me/eligibility/", DonorEligibilityView.as_view(), name="donor-eligibility"),
    path("me/reports/", MyLabReportsView.as_view(), name="donor-my-reports"),
    path("reports/upload/", LabReportUploadView.as_view(), name="donor-upload-report"),
    path("reports/pending/", PendingLabReportsView.as_view(), name="donor-reports-pending"),
    path("reports/<int:pk>/review/", LabReportReviewView.as_view(), name="donor-review-report"),
    path("search/", DonorSearchView.as_view(), name="donor-search"),
]
