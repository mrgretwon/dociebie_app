from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from django.conf import settings
from django.db.models import Avg, F, FloatField, Q, Value
from django.db.models.functions import ACos, Cos, Radians, Sin
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, OpeningHours, Review, Salon, Service
from .serializers import (
    CategorySerializer,
    ReviewSerializer,
    SalonListSerializer,
    ServiceSerializer,
)


class CategoryListView(generics.ListAPIView):
    """GET /api/categories/"""

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = None


class SalonListView(generics.ListAPIView):
    """GET /api/salons/ — supports search, location, start_date, start_hour, end_hour query params."""

    serializer_class = SalonListSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        qs = Salon.objects.select_related("category").prefetch_related(
            "opening_hours", "employees", "reviews"
        ).annotate(avg_rating=Avg("reviews__rating"))

        search = self.request.query_params.get("search")
        location = self.request.query_params.get("location")
        start_date = self.request.query_params.get("start_date")
        start_hour = self.request.query_params.get("start_hour")
        end_hour = self.request.query_params.get("end_hour")
        lat = self.request.query_params.get("lat")
        lng = self.request.query_params.get("lng")
        distance_km = self.request.query_params.get("distance")

        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(category__name__icontains=search)
                | Q(services__name__icontains=search)
            ).distinct()

        # Distance-based filtering using Haversine formula
        if lat and lng and distance_km:
            try:
                lat_val = float(lat)
                lng_val = float(lng)
                distance_val = float(distance_km)

                lat_rad = Radians(Value(lat_val))
                lng_rad = Radians(Value(lng_val))

                distance_expr = Value(6371.0) * ACos(
                    Cos(lat_rad) * Cos(Radians(F('latitude'))) *
                    Cos(Radians(F('longitude')) - lng_rad) +
                    Sin(lat_rad) * Sin(Radians(F('latitude')))
                )

                qs = qs.filter(latitude__isnull=False, longitude__isnull=False)
                qs = qs.annotate(distance=distance_expr)
                qs = qs.filter(distance__lte=distance_val)
                qs = qs.order_by('distance')
            except ValueError:
                pass
        elif location:
            # Fallback to text-based location filtering when no coordinates
            qs = qs.filter(
                Q(location_name__icontains=location)
            )

        if start_date and (start_hour or end_hour):
            try:
                target_date = datetime.strptime(start_date, "%Y-%m-%d").date()
                day_of_week = target_date.weekday()
                hours_filter = Q(opening_hours__day_of_week=day_of_week)
                if start_hour:
                    hours_filter &= Q(opening_hours__open_time__lte=start_hour)
                if end_hour:
                    hours_filter &= Q(opening_hours__close_time__gte=end_hour)
                qs = qs.filter(hours_filter).distinct()
            except ValueError:
                pass

        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        return ctx


class SalonDetailView(generics.RetrieveAPIView):
    """GET /api/salons/{id}/"""

    serializer_class = SalonListSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        return Salon.objects.select_related("category").prefetch_related(
            "opening_hours", "employees", "reviews"
        ).annotate(avg_rating=Avg("reviews__rating"))


class SalonServicesView(generics.ListAPIView):
    """GET /api/salons/{id}/services/"""

    serializer_class = ServiceSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = None

    def get_queryset(self):
        return Service.objects.filter(salon_id=self.kwargs["pk"])


class SalonReviewsView(generics.ListAPIView):
    """GET /api/salons/{id}/reviews/"""

    serializer_class = ReviewSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = None

    def get_queryset(self):
        return Review.objects.filter(salon_id=self.kwargs["pk"])


class SalonAvailableSlotsView(APIView):
    """GET /api/salons/{id}/available-slots/?date=YYYY-MM-DD&service_id=N

    Public endpoint — no auth required.
    Returns 30-minute time slots based on the salon's opening hours.
    """

    permission_classes = (permissions.AllowAny,)

    def get(self, request, pk):
        try:
            salon = Salon.objects.get(pk=pk)
        except Salon.DoesNotExist:
            return Response(
                {"detail": "Salon not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        date_str = request.query_params.get("date")
        service_id = request.query_params.get("service_id")

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
            return Response([])

        # Generate 30-minute slots within opening hours
        from apps.appointments.models import Appointment

        slots = []
        current = datetime.combine(target_date, opening.open_time)
        end = datetime.combine(target_date, opening.close_time)

        local_tz = ZoneInfo(settings.TIME_ZONE)

        existing = Appointment.objects.filter(
            salon=salon,
            date__date=target_date,
        ).exclude(status="cancelled").select_related("service")

        while current < end:
            slot_time = current.time()
            available = True
            for appt in existing:
                appt_local = appt.date.astimezone(local_tz)
                appt_start = appt_local.replace(tzinfo=None)
                appt_end = appt_start + timedelta(minutes=appt.service.minutes_duration)
                slot_dt = current
                slot_dt_end = slot_dt + timedelta(minutes=service.minutes_duration)
                if slot_dt < appt_end and slot_dt_end > appt_start:
                    available = False
                    break

            slot_end_time = (current + timedelta(minutes=service.minutes_duration)).time()
            slots.append({
                "start_time": slot_time.strftime("%H:%M"),
                "end_time": slot_end_time.strftime("%H:%M"),
                "available": available,
            })
            current += timedelta(minutes=30)

        return Response(slots)
