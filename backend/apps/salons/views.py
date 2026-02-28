from django.db.models import Avg, Q
from rest_framework import generics, permissions

from .models import Category, Review, Salon, Service
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
    """GET /api/salons/ — supports search, location, start_date, end_date query params."""

    serializer_class = SalonListSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        qs = Salon.objects.select_related("category").prefetch_related(
            "opening_hours", "employees", "reviews"
        ).annotate(avg_rating=Avg("reviews__rating"))

        search = self.request.query_params.get("search")
        location = self.request.query_params.get("location")

        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(category__name__icontains=search)
                | Q(services__name__icontains=search)
            ).distinct()

        if location:
            qs = qs.filter(
                Q(location_name__icontains=location)
            )

        # start_date / end_date are accepted but not filtered for now
        # (would require availability model in the future).

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
