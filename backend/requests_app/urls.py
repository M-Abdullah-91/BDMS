from django.urls import path

from .views import (
    BloodRequestDetailView,
    BloodRequestListCreateView,
    BloodRequestStatusView,
    MyResponsesView,
    RequestResponsesListView,
    RespondToRequestView,
)

urlpatterns = [
    path("", BloodRequestListCreateView.as_view(), name="requests-list-create"),
    path("my-responses/", MyResponsesView.as_view(), name="requests-my-responses"),
    path("<int:pk>/", BloodRequestDetailView.as_view(), name="request-detail"),
    path("<int:pk>/status/", BloodRequestStatusView.as_view(), name="request-status"),
    path("<int:pk>/respond/", RespondToRequestView.as_view(), name="request-respond"),
    path("<int:pk>/responses/", RequestResponsesListView.as_view(), name="request-responses"),
]
