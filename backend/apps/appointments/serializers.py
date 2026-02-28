from rest_framework import serializers

from apps.salons.serializers import EmployeeSerializer, ServiceSerializer
from apps.salons.serializers import SalonListSerializer

from .models import Appointment


class AppointmentStatusSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    text = serializers.CharField()
    is_status_alright = serializers.BooleanField()


class AppointmentReadSerializer(serializers.ModelSerializer):
    """Serializer for listing appointments (GET)."""

    salon = SalonListSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    worker = EmployeeSerializer(source="employee", read_only=True)
    status = AppointmentStatusSerializer(source="status_detail", read_only=True)

    class Meta:
        model = Appointment
        fields = ("id", "salon", "worker", "service", "date", "status")


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating an appointment (POST)."""

    class Meta:
        model = Appointment
        fields = ("salon", "service", "employee", "date")

    def validate(self, attrs):
        # Ensure service belongs to the salon
        if attrs["service"].salon_id != attrs["salon"].id:
            raise serializers.ValidationError("Service does not belong to this salon.")
        # Ensure employee belongs to the salon
        if attrs["employee"].salon_id != attrs["salon"].id:
            raise serializers.ValidationError("Employee does not belong to this salon.")
        return attrs

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
