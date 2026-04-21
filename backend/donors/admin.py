from django.contrib import admin

from .models import DonorProfile, LabReport


@admin.register(DonorProfile)
class DonorProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "blood_group", "is_verified", "available", "last_donation_date")
    list_filter = ("blood_group", "is_verified", "available")
    search_fields = ("user__username", "user__first_name", "user__last_name")


@admin.register(LabReport)
class LabReportAdmin(admin.ModelAdmin):
    list_display = ("donor", "status", "uploaded_at", "reviewed_by", "reviewed_at")
    list_filter = ("status",)
