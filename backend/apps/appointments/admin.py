from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "salon", "service", "employee", "date", "status")
    list_filter = ("status", "salon")
    search_fields = ("user__email", "salon__name")
    date_hierarchy = "date"
