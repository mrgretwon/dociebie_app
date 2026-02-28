from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.appointments.models import Appointment
from apps.salons.models import Category, Employee, OpeningHours, Salon, Service
from apps.salons.serializers import CategorySerializer, EmployeeSerializer

from .models import Client, ClientGroup, ClientGroupMembership

User = get_user_model()


# ---------------------------------------------------------------------------
# Salon
# ---------------------------------------------------------------------------
class ProviderSalonSerializer(serializers.ModelSerializer):
    """Read serializer for the provider's own salon."""

    type = serializers.CharField(source="category.name", default="")
    category_id = serializers.PrimaryKeyRelatedField(
        source="category", queryset=Category.objects.all(), required=False,
    )
    rating = serializers.FloatField(read_only=True)
    opening_hours = serializers.SerializerMethodField()
    employees = EmployeeSerializer(many=True, read_only=True)
    subscription_active = serializers.BooleanField(read_only=True)
    subscription_expiry = serializers.DateField(read_only=True)

    class Meta:
        model = Salon
        fields = (
            "id",
            "name",
            "type",
            "category_id",
            "location_name",
            "phone_number",
            "mail",
            "rating",
            "latitude",
            "longitude",
            "opening_hours",
            "employees",
            "main_image",
            "subscription_active",
            "subscription_expiry",
            "created_at",
        )

    def get_opening_hours(self, obj) -> list[dict]:
        DAY_NAMES_SHORT = {
            0: "Pon", 1: "Wt", 2: "Śr", 3: "Czw", 4: "Pt", 5: "Sob", 6: "Ndz",
        }
        result = []
        for h in obj.opening_hours.all():
            day_name = DAY_NAMES_SHORT.get(h.day_of_week, "?")
            result.append({
                "id": h.id,
                "day_of_week": h.day_of_week,
                "open_time": h.open_time.strftime("%H:%M"),
                "close_time": h.close_time.strftime("%H:%M"),
                "display": f"{day_name} {h.open_time:%H:%M} – {h.close_time:%H:%M}",
            })
        return result


class ProviderSalonUpdateSerializer(serializers.ModelSerializer):
    """Update serializer — only mutable salon fields."""

    category_id = serializers.PrimaryKeyRelatedField(
        source="category", queryset=Category.objects.all(), required=False,
    )

    class Meta:
        model = Salon
        fields = (
            "name",
            "category_id",
            "location_name",
            "phone_number",
            "mail",
            "main_image",
        )
        extra_kwargs = {field: {"required": False} for field in fields}


# ---------------------------------------------------------------------------
# Opening hours
# ---------------------------------------------------------------------------
class OpeningHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningHours
        fields = ("id", "day_of_week", "open_time", "close_time")


class OpeningHoursCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningHours
        fields = ("day_of_week", "open_time", "close_time")


class OpeningHoursBulkSerializer(serializers.Serializer):
    """Accepts a list of opening hours for bulk replacement."""

    opening_hours = OpeningHoursCreateSerializer(many=True)


# ---------------------------------------------------------------------------
# Subscription & bank account
# ---------------------------------------------------------------------------
class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salon
        fields = ("subscription_active", "subscription_expiry")


class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salon
        fields = ("bank_name", "bank_account_number", "bank_holder_name")


# ---------------------------------------------------------------------------
# Employees
# ---------------------------------------------------------------------------
class ProviderEmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ("id", "name", "surname", "image")


class ProviderEmployeeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ("name", "surname")


# ---------------------------------------------------------------------------
# Services
# ---------------------------------------------------------------------------
class ProviderServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ("id", "name", "price", "minutes_duration")


class ProviderServiceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ("name", "price", "minutes_duration")


# ---------------------------------------------------------------------------
# Clients
# ---------------------------------------------------------------------------
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ("id", "name", "surname", "email", "phone", "notes", "created_at")
        read_only_fields = ("id", "created_at")


class ClientCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ("name", "surname", "email", "phone", "notes")


# ---------------------------------------------------------------------------
# Client groups
# ---------------------------------------------------------------------------
class ClientGroupListSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ClientGroup
        fields = ("id", "name", "image", "member_count", "created_at")


class ClientGroupDetailSerializer(serializers.ModelSerializer):
    members = ClientSerializer(source="get_members", many=True, read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = ClientGroup
        fields = ("id", "name", "image", "members", "member_count", "created_at")

    def get_member_count(self, obj) -> int:
        return obj.memberships.count()


class ClientGroupCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientGroup
        fields = ("name", "image")
        extra_kwargs = {"image": {"required": False}}


class ClientGroupMemberAddSerializer(serializers.Serializer):
    client_id = serializers.IntegerField()


# ---------------------------------------------------------------------------
# Appointments (provider perspective)
# ---------------------------------------------------------------------------
class ProviderAppointmentSerializer(serializers.ModelSerializer):
    """Read serializer for appointments from the provider's perspective."""

    from apps.appointments.models import Appointment

    service_name = serializers.CharField(source="service.name", read_only=True)
    service_price = serializers.DecimalField(
        source="service.price", max_digits=10, decimal_places=2, read_only=True
    )
    service_duration = serializers.IntegerField(
        source="service.minutes_duration", read_only=True
    )
    employee_name = serializers.SerializerMethodField()
    client_email = serializers.CharField(source="user.email", read_only=True)
    client_name = serializers.SerializerMethodField()

    class Meta:
        from apps.appointments.models import Appointment

        model = Appointment
        fields = (
            "id",
            "date",
            "status",
            "service",
            "service_name",
            "service_price",
            "service_duration",
            "employee",
            "employee_name",
            "client_email",
            "client_name",
            "created_at",
        )

    def get_employee_name(self, obj) -> str:
        return f"{obj.employee.name} {obj.employee.surname}".strip()

    def get_client_name(self, obj) -> str:
        return f"{obj.user.name} {obj.user.surname}".strip()


class ProviderAppointmentCreateSerializer(serializers.Serializer):
    """Create appointment from provider side. Auto-creates user if needed."""

    client_email = serializers.EmailField()
    client_name = serializers.CharField(required=False, default="")
    service_id = serializers.IntegerField()
    employee_id = serializers.IntegerField()
    date = serializers.DateTimeField()

    def validate(self, attrs):
        salon = self.context["salon"]

        # Validate service belongs to salon
        try:
            service = Service.objects.get(id=attrs["service_id"], salon=salon)
        except Service.DoesNotExist:
            raise serializers.ValidationError({"service_id": "Service not found in this salon."})
        attrs["service"] = service

        # Validate employee belongs to salon
        try:
            employee = Employee.objects.get(id=attrs["employee_id"], salon=salon)
        except Employee.DoesNotExist:
            raise serializers.ValidationError({"employee_id": "Employee not found in this salon."})
        attrs["employee"] = employee

        return attrs


class ProviderAppointmentUpdateSerializer(serializers.ModelSerializer):
    """Update appointment status."""

    class Meta:
        model = Appointment
        fields = ("status",)


# ---------------------------------------------------------------------------
# Available slots
# ---------------------------------------------------------------------------
class AvailableSlotSerializer(serializers.Serializer):
    start_time = serializers.TimeField(format="%H:%M")
    end_time = serializers.TimeField(format="%H:%M")
    available = serializers.BooleanField()


# ---------------------------------------------------------------------------
# Financial
# ---------------------------------------------------------------------------
class FinancialSummarySerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    bookings_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_bookings = serializers.IntegerField()
    completed_bookings = serializers.IntegerField()
    cancelled_bookings = serializers.IntegerField()
    average_booking_value = serializers.DecimalField(max_digits=10, decimal_places=2)


class PaymentHistoryItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    date = serializers.DateTimeField()
    client_name = serializers.CharField()
    client_email = serializers.CharField()
    service_name = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.CharField()


class ReportRequestSerializer(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()
