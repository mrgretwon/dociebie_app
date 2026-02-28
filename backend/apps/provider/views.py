import secrets
from datetime import datetime, time, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import generics, status, views
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.appointments.models import Appointment
from apps.salons.models import Employee, OpeningHours, Salon, Service

from .models import Client, ClientGroup, ClientGroupMembership
from .permissions import IsProvider
from .serializers import (
    AvailableSlotSerializer,
    BankAccountSerializer,
    ClientCreateSerializer,
    ClientGroupCreateUpdateSerializer,
    ClientGroupDetailSerializer,
    ClientGroupListSerializer,
    ClientGroupMemberAddSerializer,
    ClientSerializer,
    FinancialSummarySerializer,
    OpeningHoursCreateSerializer,
    OpeningHoursBulkSerializer,
    OpeningHoursSerializer,
    PaymentHistoryItemSerializer,
    ProviderAppointmentCreateSerializer,
    ProviderAppointmentSerializer,
    ProviderAppointmentUpdateSerializer,
    ProviderEmployeeCreateSerializer,
    ProviderEmployeeSerializer,
    ProviderSalonSerializer,
    ProviderSalonUpdateSerializer,
    ProviderServiceCreateSerializer,
    ProviderServiceSerializer,
    ReportRequestSerializer,
    SubscriptionSerializer,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Mixin: auto-resolve provider's salon
# ---------------------------------------------------------------------------
class ProviderSalonMixin:
    """Adds get_salon() to resolve the authenticated provider's salon."""

    def get_salon(self) -> Salon:
        return Salon.objects.select_related("category").prefetch_related(
            "opening_hours", "employees", "reviews"
        ).filter(owner=self.request.user).first()


# ---------------------------------------------------------------------------
# Salon
# ---------------------------------------------------------------------------
class ProviderSalonView(ProviderSalonMixin, views.APIView):
    """
    GET  /api/provider/salon/ — get provider's own salon.
    PATCH /api/provider/salon/ — update salon info (supports multipart for image upload).
    """

    permission_classes = (IsProvider,)
    parser_classes = (MultiPartParser, JSONParser)

    def get(self, request):
        salon = self.get_salon()
        if not salon:
            return Response(
                {"detail": "No salon found for this provider."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ProviderSalonSerializer(salon, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        salon = self.get_salon()
        if not salon:
            return Response(
                {"detail": "No salon found for this provider."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ProviderSalonUpdateSerializer(salon, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Return full salon data
        return Response(
            ProviderSalonSerializer(salon, context={"request": request}).data
        )


# ---------------------------------------------------------------------------
# Opening hours
# ---------------------------------------------------------------------------
class ProviderOpeningHoursView(ProviderSalonMixin, views.APIView):
    """
    GET  /api/provider/salon/opening-hours/ — list opening hours.
    POST /api/provider/salon/opening-hours/ — add single entry.
    PUT  /api/provider/salon/opening-hours/ — bulk replace all.
    """

    permission_classes = (IsProvider,)

    def get(self, request):
        salon = self.get_salon()
        if not salon:
            return Response({"detail": "No salon found."}, status=status.HTTP_404_NOT_FOUND)
        hours = OpeningHours.objects.filter(salon=salon)
        return Response(OpeningHoursSerializer(hours, many=True).data)

    def post(self, request):
        salon = self.get_salon()
        if not salon:
            return Response({"detail": "No salon found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = OpeningHoursCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(salon=salon)
        return Response(
            OpeningHoursSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED,
        )

    def put(self, request):
        salon = self.get_salon()
        if not salon:
            return Response({"detail": "No salon found."}, status=status.HTTP_404_NOT_FOUND)
        bulk_serializer = OpeningHoursBulkSerializer(data=request.data)
        bulk_serializer.is_valid(raise_exception=True)

        # Delete existing and recreate
        OpeningHours.objects.filter(salon=salon).delete()
        entries = []
        for item in bulk_serializer.validated_data["opening_hours"]:
            entries.append(OpeningHours(salon=salon, **item))
        OpeningHours.objects.bulk_create(entries)

        hours = OpeningHours.objects.filter(salon=salon)
        return Response(OpeningHoursSerializer(hours, many=True).data)


class ProviderOpeningHoursDeleteView(ProviderSalonMixin, views.APIView):
    """DELETE /api/provider/salon/opening-hours/{id}/"""

    permission_classes = (IsProvider,)

    def delete(self, request, pk):
        salon = self.get_salon()
        if not salon:
            return Response({"detail": "No salon found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            entry = OpeningHours.objects.get(id=pk, salon=salon)
        except OpeningHours.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Subscription
# ---------------------------------------------------------------------------
class ProviderSubscriptionView(ProviderSalonMixin, views.APIView):
    """PATCH /api/provider/salon/subscription/"""

    permission_classes = (IsProvider,)

    def patch(self, request):
        salon = self.get_salon()
        if not salon:
            return Response({"detail": "No salon found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = SubscriptionSerializer(salon, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Bank account
# ---------------------------------------------------------------------------
class ProviderBankAccountView(ProviderSalonMixin, views.APIView):
    """
    GET  /api/provider/salon/bank-account/
    PATCH /api/provider/salon/bank-account/
    """

    permission_classes = (IsProvider,)

    def get(self, request):
        salon = self.get_salon()
        if not salon:
            return Response({"detail": "No salon found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(BankAccountSerializer(salon).data)

    def patch(self, request):
        salon = self.get_salon()
        if not salon:
            return Response({"detail": "No salon found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = BankAccountSerializer(salon, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Employees CRUD
# ---------------------------------------------------------------------------
class ProviderEmployeeListCreateView(ProviderSalonMixin, generics.ListCreateAPIView):
    """
    GET  /api/provider/employees/ — list salon employees.
    POST /api/provider/employees/ — create employee.
    """

    permission_classes = (IsProvider,)
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProviderEmployeeCreateSerializer
        return ProviderEmployeeSerializer

    def get_queryset(self):
        salon = self.get_salon()
        if not salon:
            return Employee.objects.none()
        return Employee.objects.filter(salon=salon)

    def create(self, request, *args, **kwargs):
        salon = self.get_salon()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(salon=salon)
        return Response(
            ProviderEmployeeSerializer(serializer.instance, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class ProviderEmployeeDetailView(ProviderSalonMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/provider/employees/{id}/
    PATCH  /api/provider/employees/{id}/ — supports MultiPartParser for image upload.
    DELETE /api/provider/employees/{id}/
    """

    permission_classes = (IsProvider,)
    serializer_class = ProviderEmployeeSerializer
    parser_classes = (MultiPartParser, JSONParser)

    def get_queryset(self):
        salon = self.get_salon()
        if not salon:
            return Employee.objects.none()
        return Employee.objects.filter(salon=salon)


# ---------------------------------------------------------------------------
# Services CRUD
# ---------------------------------------------------------------------------
class ProviderServiceListCreateView(ProviderSalonMixin, generics.ListCreateAPIView):
    """
    GET  /api/provider/services/ — list salon services.
    POST /api/provider/services/ — create service.
    """

    permission_classes = (IsProvider,)
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProviderServiceCreateSerializer
        return ProviderServiceSerializer

    def get_queryset(self):
        salon = self.get_salon()
        if not salon:
            return Service.objects.none()
        return Service.objects.filter(salon=salon)

    def create(self, request, *args, **kwargs):
        salon = self.get_salon()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(salon=salon)
        return Response(
            ProviderServiceSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED,
        )


class ProviderServiceDetailView(ProviderSalonMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/provider/services/{id}/
    PATCH  /api/provider/services/{id}/
    DELETE /api/provider/services/{id}/
    """

    permission_classes = (IsProvider,)
    serializer_class = ProviderServiceSerializer

    def get_queryset(self):
        salon = self.get_salon()
        if not salon:
            return Service.objects.none()
        return Service.objects.filter(salon=salon)


# ---------------------------------------------------------------------------
# Clients
# ---------------------------------------------------------------------------
class ProviderClientListCreateView(ProviderSalonMixin, generics.ListCreateAPIView):
    """
    GET  /api/provider/clients/ — list clients (optional date filtering).
    POST /api/provider/clients/ — create client.
    """

    permission_classes = (IsProvider,)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ClientCreateSerializer
        return ClientSerializer

    def create(self, request, *args, **kwargs):
        serializer = ClientCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(provider=request.user)
        return Response(
            ClientSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED,
        )

    def get_queryset(self):
        qs = Client.objects.filter(provider=self.request.user)

        # Optional date filtering — filter clients who had visits in the date range
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")
        if start_date or end_date:
            salon = self.get_salon()
            if salon:
                # Find users with appointments in this salon in the date range
                appt_filter = Q(user__appointments__salon=salon)
                if start_date:
                    appt_filter &= Q(user__appointments__date__date__gte=start_date)
                if end_date:
                    appt_filter &= Q(user__appointments__date__date__lte=end_date)
                # Get emails of clients with matching appointments
                emails = (
                    User.objects.filter(appt_filter)
                    .values_list("email", flat=True)
                    .distinct()
                )
                qs = qs.filter(email__in=emails)

        return qs


class ProviderClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET   /api/provider/clients/{id}/
    PATCH /api/provider/clients/{id}/
    """

    permission_classes = (IsProvider,)
    serializer_class = ClientSerializer

    def get_queryset(self):
        return Client.objects.filter(provider=self.request.user)


class ProviderClientVisitsView(ProviderSalonMixin, views.APIView):
    """GET /api/provider/clients/{id}/visits/ — visits for a specific client."""

    permission_classes = (IsProvider,)

    def get(self, request, pk):
        salon = self.get_salon()
        if not salon:
            return Response({"detail": "No salon found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            client = Client.objects.get(id=pk, provider=request.user)
        except Client.DoesNotExist:
            return Response({"detail": "Client not found."}, status=status.HTTP_404_NOT_FOUND)

        # Find appointments by matching email
        appointments = Appointment.objects.filter(
            salon=salon, user__email=client.email
        ).select_related("service", "employee", "user")

        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        if start_date:
            appointments = appointments.filter(date__date__gte=start_date)
        if end_date:
            appointments = appointments.filter(date__date__lte=end_date)

        serializer = ProviderAppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Client groups
# ---------------------------------------------------------------------------
class ProviderClientGroupListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/provider/client-groups/
    POST /api/provider/client-groups/
    """

    permission_classes = (IsProvider,)
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ClientGroupCreateUpdateSerializer
        return ClientGroupListSerializer

    def get_queryset(self):
        return (
            ClientGroup.objects.filter(provider=self.request.user)
            .annotate(member_count=Count("memberships"))
        )

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)


class ProviderClientGroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/provider/client-groups/{id}/
    PATCH  /api/provider/client-groups/{id}/
    DELETE /api/provider/client-groups/{id}/
    """

    permission_classes = (IsProvider,)

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return ClientGroupCreateUpdateSerializer
        return ClientGroupDetailSerializer

    def get_queryset(self):
        return ClientGroup.objects.filter(provider=self.request.user)

    def get_object(self):
        obj = super().get_object()
        # Attach members for the detail serializer
        obj.get_members = list(
            Client.objects.filter(group_memberships__group=obj)
        )
        return obj


class ProviderClientGroupMemberAddView(ProviderSalonMixin, views.APIView):
    """POST /api/provider/client-groups/{id}/members/"""

    permission_classes = (IsProvider,)

    def post(self, request, pk):
        try:
            group = ClientGroup.objects.get(id=pk, provider=request.user)
        except ClientGroup.DoesNotExist:
            return Response({"detail": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ClientGroupMemberAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        client_id = serializer.validated_data["client_id"]
        try:
            client = Client.objects.get(id=client_id, provider=request.user)
        except Client.DoesNotExist:
            return Response({"detail": "Client not found."}, status=status.HTTP_404_NOT_FOUND)

        _, created = ClientGroupMembership.objects.get_or_create(
            group=group, client=client
        )
        if not created:
            return Response(
                {"detail": "Client already in group."},
                status=status.HTTP_409_CONFLICT,
            )
        return Response({"detail": "Member added."}, status=status.HTTP_201_CREATED)


class ProviderClientGroupMemberRemoveView(views.APIView):
    """DELETE /api/provider/client-groups/{group_id}/members/{client_id}/"""

    permission_classes = (IsProvider,)

    def delete(self, request, group_id, client_id):
        try:
            membership = ClientGroupMembership.objects.get(
                group__id=group_id,
                group__provider=request.user,
                client__id=client_id,
            )
        except ClientGroupMembership.DoesNotExist:
            return Response({"detail": "Membership not found."}, status=status.HTTP_404_NOT_FOUND)
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Appointments / Calendar
# ---------------------------------------------------------------------------
class ProviderAppointmentListCreateView(ProviderSalonMixin, views.APIView):
    """
    GET  /api/provider/appointments/ — list salon appointments.
    POST /api/provider/appointments/ — create appointment.
    """

    permission_classes = (IsProvider,)

    def get(self, request):
        salon = self.get_salon()
        if not salon:
            return Response({"detail": "No salon found."}, status=status.HTTP_404_NOT_FOUND)

        appointments = Appointment.objects.filter(salon=salon).select_related(
            "service", "employee", "user"
        )

        # Filter by specific date
        date_param = request.query_params.get("date")
        if date_param:
            appointments = appointments.filter(date__date=date_param)

        # Filter by month/year
        month = request.query_params.get("month")
        year = request.query_params.get("year")
        if month and year:
            appointments = appointments.filter(
                date__month=int(month), date__year=int(year)
            )

        serializer = ProviderAppointmentSerializer(appointments, many=True)
        return Response(serializer.data)

    def post(self, request):
        salon = self.get_salon()
        if not salon:
            return Response({"detail": "No salon found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProviderAppointmentCreateSerializer(
            data=request.data, context={"salon": salon}
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Find or create user by email
        email = data["client_email"]
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Auto-create client user
            random_password = secrets.token_urlsafe(12)
            name_parts = data.get("client_name", "").split(" ", 1)
            user = User.objects.create_user(
                email=email,
                password=random_password,
                name=name_parts[0] if name_parts else "",
                surname=name_parts[1] if len(name_parts) > 1 else "",
                role="client",
            )

        appointment = Appointment.objects.create(
            user=user,
            salon=salon,
            service=data["service"],
            employee=data["employee"],
            date=data["date"],
            status="unpaid",
        )
        return Response(
            ProviderAppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED,
        )


class ProviderAppointmentDetailView(ProviderSalonMixin, generics.RetrieveUpdateAPIView):
    """
    GET   /api/provider/appointments/{id}/ — get appointment detail.
    PATCH /api/provider/appointments/{id}/ — update appointment (e.g. status).
    """

    permission_classes = (IsProvider,)

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return ProviderAppointmentUpdateSerializer
        return ProviderAppointmentSerializer

    def get_queryset(self):
        salon = self.get_salon()
        if not salon:
            return Appointment.objects.none()
        return Appointment.objects.filter(salon=salon).select_related(
            "user", "service", "employee"
        )


class ProviderAvailableSlotsView(ProviderSalonMixin, views.APIView):
    """GET /api/provider/appointments/available-slots/?date=YYYY-MM-DD&service_id=N[&employee_id=N]"""

    permission_classes = (IsProvider,)

    def get(self, request):
        salon = self.get_salon()
        if not salon:
            return Response({"detail": "No salon found."}, status=status.HTTP_404_NOT_FOUND)

        date_str = request.query_params.get("date")
        service_id = request.query_params.get("service_id")
        employee_id = request.query_params.get("employee_id")

        if not date_str or not service_id:
            return Response(
                {"detail": "Both 'date' and 'service_id' are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"detail": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service = Service.objects.get(id=service_id, salon=salon)
        except Service.DoesNotExist:
            return Response(
                {"detail": "Service not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Look up opening hours for the target day
        day_of_week = target_date.weekday()  # 0=Monday .. 6=Sunday
        opening = OpeningHours.objects.filter(
            salon=salon, day_of_week=day_of_week
        ).first()

        if not opening:
            # Salon is closed on this day
            return Response([])

        # Generate 30-minute slots within opening hours
        slots = []
        current = datetime.combine(target_date, opening.open_time)
        end = datetime.combine(target_date, opening.close_time)

        # Get existing appointments for this date, optionally filtered by employee
        existing = Appointment.objects.filter(
            salon=salon,
            date__date=target_date,
        ).exclude(status="cancelled").select_related("service")

        if employee_id:
            existing = existing.filter(employee_id=employee_id)

        while current < end:
            slot_dt_end = current + timedelta(minutes=service.minutes_duration)
            # Slot must fit before closing time
            if slot_dt_end > end:
                break

            slot_time = current.time()
            # Check if slot conflicts with existing appointments
            available = True
            for appt in existing:
                appt_start = appt.date.replace(tzinfo=None) if appt.date.tzinfo else appt.date
                appt_end = appt_start + timedelta(minutes=appt.service.minutes_duration)
                if current < appt_end and slot_dt_end > appt_start:
                    available = False
                    break

            slot_end_time = slot_dt_end.time()
            slots.append({"start_time": slot_time, "end_time": slot_end_time, "available": available})
            current += timedelta(minutes=30)

        serializer = AvailableSlotSerializer(slots, many=True)
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Financial
# ---------------------------------------------------------------------------
class ProviderFinancialSummaryView(ProviderSalonMixin, views.APIView):
    """GET /api/provider/financial-summary/"""

    permission_classes = (IsProvider,)

    def get(self, request):
        salon = self.get_salon()
        if not salon:
            return Response({"detail": "No salon found."}, status=status.HTTP_404_NOT_FOUND)

        appointments = Appointment.objects.filter(salon=salon)

        completed = appointments.filter(status="completed")
        cancelled = appointments.filter(status="cancelled")

        total_revenue = completed.aggregate(
            total=Sum("service__price")
        )["total"] or Decimal("0.00")

        active_bookings = appointments.filter(status__in=["paid", "unpaid"])
        bookings_revenue = active_bookings.aggregate(
            total=Sum("service__price")
        )["total"] or Decimal("0.00")

        total_bookings = appointments.count()
        completed_count = completed.count()
        cancelled_count = cancelled.count()
        avg_value = (
            total_revenue / completed_count if completed_count > 0 else Decimal("0.00")
        )

        data = {
            "total_revenue": total_revenue,
            "bookings_revenue": bookings_revenue,
            "total_bookings": total_bookings,
            "completed_bookings": completed_count,
            "cancelled_bookings": cancelled_count,
            "average_booking_value": round(avg_value, 2),
        }
        serializer = FinancialSummarySerializer(data)
        return Response(serializer.data)


class ProviderPaymentHistoryView(ProviderSalonMixin, views.APIView):
    """GET /api/provider/payment-history/"""

    permission_classes = (IsProvider,)

    def get(self, request):
        salon = self.get_salon()
        if not salon:
            return Response({"detail": "No salon found."}, status=status.HTTP_404_NOT_FOUND)

        appointments = Appointment.objects.filter(
            salon=salon, status="completed"
        ).select_related("service", "user").order_by("-date")

        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        if start_date:
            appointments = appointments.filter(date__date__gte=start_date)
        if end_date:
            appointments = appointments.filter(date__date__lte=end_date)

        items = []
        for appt in appointments:
            items.append({
                "id": appt.id,
                "date": appt.date,
                "client_name": f"{appt.user.name} {appt.user.surname}".strip(),
                "client_email": appt.user.email,
                "service_name": appt.service.name,
                "amount": appt.service.price,
                "status": appt.status,
            })

        serializer = PaymentHistoryItemSerializer(items, many=True)
        return Response(serializer.data)


class ProviderReportView(ProviderSalonMixin, views.APIView):
    """POST /api/provider/reports/ — generate report JSON for date range."""

    permission_classes = (IsProvider,)

    def post(self, request):
        salon = self.get_salon()
        if not salon:
            return Response({"detail": "No salon found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReportRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        start_date = serializer.validated_data["start_date"]
        end_date = serializer.validated_data["end_date"]

        appointments = Appointment.objects.filter(
            salon=salon,
            date__date__gte=start_date,
            date__date__lte=end_date,
        ).select_related("service", "employee", "user")

        total = appointments.count()
        completed = appointments.filter(status="completed")
        cancelled = appointments.filter(status="cancelled")

        revenue = completed.aggregate(total=Sum("service__price"))["total"] or Decimal("0.00")

        # Revenue by service
        revenue_by_service = {}
        for appt in completed:
            svc_name = appt.service.name
            revenue_by_service[svc_name] = (
                revenue_by_service.get(svc_name, Decimal("0.00")) + appt.service.price
            )

        # Revenue by employee
        revenue_by_employee = {}
        for appt in completed:
            emp_name = f"{appt.employee.name} {appt.employee.surname}".strip()
            revenue_by_employee[emp_name] = (
                revenue_by_employee.get(emp_name, Decimal("0.00")) + appt.service.price
            )

        # Top clients
        client_counts = {}
        for appt in appointments:
            email = appt.user.email
            client_counts[email] = client_counts.get(email, 0) + 1
        top_clients = sorted(client_counts.items(), key=lambda x: -x[1])[:10]

        report = {
            "period": {"start_date": str(start_date), "end_date": str(end_date)},
            "total_appointments": total,
            "completed_appointments": completed.count(),
            "cancelled_appointments": cancelled.count(),
            "total_revenue": str(revenue),
            "average_revenue_per_appointment": str(
                round(revenue / completed.count(), 2) if completed.count() > 0 else "0.00"
            ),
            "revenue_by_service": {k: str(v) for k, v in revenue_by_service.items()},
            "revenue_by_employee": {k: str(v) for k, v in revenue_by_employee.items()},
            "top_clients": [{"email": e, "appointment_count": c} for e, c in top_clients],
        }

        return Response(report)
