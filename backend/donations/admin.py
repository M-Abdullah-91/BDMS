from django.contrib import admin

from .models import Donation


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ("donor", "hospital", "blood_group", "units", "donation_date")
    list_filter = ("blood_group", "donation_date", "hospital__city")
