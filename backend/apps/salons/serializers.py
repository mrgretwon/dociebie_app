from rest_framework import serializers

from .models import Category, Employee, OpeningHours, Review, Salon, Service


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name")


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ("id", "name", "surname", "image")


class OpeningHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningHours
        fields = ("text",)


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ("id", "name", "price", "minutes_duration")


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ("id", "customer_name", "customer_location", "rating", "text")


class SalonListSerializer(serializers.ModelSerializer):
    """Serializer used for listing salons and salon detail."""

    type = serializers.CharField(source="category.name", default="")
    rating = serializers.FloatField(read_only=True)
    opening_hours = serializers.SerializerMethodField()
    employees = EmployeeSerializer(many=True, read_only=True)

    class Meta:
        model = Salon
        fields = (
            "id",
            "name",
            "type",
            "location_name",
            "phone_number",
            "mail",
            "rating",
            "opening_hours",
            "employees",
            "main_image",
            "services_image",
            "reviews_image",
            "details_image",
        )

    def get_opening_hours(self, obj) -> list[str]:
        return list(obj.opening_hours.values_list("text", flat=True))
