from rest_framework import generics, permissions

from .models import Appointment
from .serializers import AppointmentCreateSerializer, AppointmentReadSerializer


class AppointmentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/appointments/ — list current user's appointments.
    POST /api/appointments/ — create a new appointment.
    """

    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AppointmentCreateSerializer
        return AppointmentReadSerializer

    def get_queryset(self):
        return (
            Appointment.objects.filter(user=self.request.user)
            .select_related("salon", "salon__category", "service", "employee")
            .prefetch_related("salon__opening_hours", "salon__employees", "salon__reviews")
        )
