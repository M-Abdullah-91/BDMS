from django.contrib import admin

from .models import BloodRequest, RequestResponse


@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):
    list_display = ("hospital", "blood_group", "units_needed", "urgency", "status", "created_at")
    list_filter = ("blood_group", "urgency", "status", "city")
    search_fields = ("hospital__name", "patient_name")


@admin.register(RequestResponse)
class RequestResponseAdmin(admin.ModelAdmin):
    list_display = ("request", "donor", "status", "created_at")
    list_filter = ("status",)
