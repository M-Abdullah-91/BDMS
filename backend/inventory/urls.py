from django.urls import path

from .views import MyInventoryDetailView, MyInventoryView, PublicInventoryView

urlpatterns = [
    path("", PublicInventoryView.as_view(), name="inventory-public"),
    path("me/", MyInventoryView.as_view(), name="inventory-me"),
    path("me/<int:pk>/", MyInventoryDetailView.as_view(), name="inventory-me-detail"),
]
