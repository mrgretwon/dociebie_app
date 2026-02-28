from rest_framework import serializers

from .models import Category, Employee, OpeningHours, Review, Salon, Service


class CategorySerializer(serializers.ModelSerializer):
    icon = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "icon")

    def get_icon(self, obj) -> str | None:
        if obj.icon:
            return f"/static/icons/categories/{obj.icon}.svg"
        return None


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ("id", "name", "surname", "image")


class OpeningHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningHours
        fields = ("day_of_week", "open_time", "close_time")


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
            "latitude",
            "longitude",
            "opening_hours",
            "employees",
            "main_image",
        )

    def get_opening_hours(self, obj) -> list[dict]:
        DAY_NAMES_SHORT = {
            0: "Pon", 1: "Wt", 2: "Śr", 3: "Czw", 4: "Pt", 5: "Sob", 6: "Ndz",
        }
        result = []
        for h in obj.opening_hours.all():
            day_name = DAY_NAMES_SHORT.get(h.day_of_week, "?")
            result.append({
                "day_of_week": h.day_of_week,
                "open_time": h.open_time.strftime("%H:%M"),
                "close_time": h.close_time.strftime("%H:%M"),
                "display": f"{day_name} {h.open_time:%H:%M} – {h.close_time:%H:%M}",
            })
        return result
