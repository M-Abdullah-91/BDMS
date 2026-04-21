from django.contrib import admin

from .models import InventoryItem


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ("hospital", "blood_group", "units", "updated_at")
    list_filter = ("blood_group", "hospital__city")
    search_fields = ("hospital__name",)
