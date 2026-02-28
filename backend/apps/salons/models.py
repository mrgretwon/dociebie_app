from django.conf import settings
from django.db import models


class Category(models.Model):
    """Salon category (e.g. Barber, SPA, Nails)."""

    ICON_CHOICES = [
        ("scissors", "Nożyczki (fryzjer/barber)"),
        ("sparkles", "Iskierki (kosmetyka/SPA)"),
        ("leaf", "Liść (ogrodnictwo)"),
        ("home", "Dom (sprzątanie)"),
        ("wrench", "Klucz (naprawa)"),
        ("truck", "Ciężarówka (przeprowadzka/kurier)"),
        ("camera", "Kamera (filmowanie/foto)"),
        ("heart", "Serce (zdrowie/wellness)"),
        ("car", "Samochód (motoryzacja)"),
        ("paw", "Łapka (zwierzęta)"),
    ]

    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, choices=ICON_CHOICES, blank=True, default="")

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "categories"

    def __str__(self) -> str:
        return self.name


class Salon(models.Model):
    """A salon owned by a provider user."""

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="salons",
        limit_choices_to={"role": "provider"},
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="salons",
    )
    name = models.CharField(max_length=255)
    location_name = models.CharField(
        max_length=255,
        help_text="Human-readable address, e.g. 'ul. Dluga 10a, Szczecin'",
    )
    phone_number = models.CharField(max_length=30, blank=True)
    mail = models.EmailField(blank=True)

    main_image = models.ImageField(upload_to="salons/main/", blank=True)

    # Subscription
    subscription_active = models.BooleanField(default=False)
    subscription_expiry = models.DateField(null=True, blank=True)

    # Geolocation
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # Bank account
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_holder_name = models.CharField(max_length=200, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name

    @property
    def type(self) -> str:
        """Category name used as 'type' in the API response."""
        return self.category.name if self.category else ""

    @property
    def rating(self) -> float:
        """Average rating computed from reviews."""
        avg = self.reviews.aggregate(avg=models.Avg("rating"))["avg"]
        return round(avg, 1) if avg else 0.0


class OpeningHours(models.Model):
    """Structured opening hours: one row per day with open/close times."""

    DAY_CHOICES = [
        (0, "Poniedziałek"),
        (1, "Wtorek"),
        (2, "Środa"),
        (3, "Czwartek"),
        (4, "Piątek"),
        (5, "Sobota"),
        (6, "Niedziela"),
    ]

    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name="opening_hours")
    day_of_week = models.PositiveSmallIntegerField(choices=DAY_CHOICES)
    open_time = models.TimeField()
    close_time = models.TimeField()
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["day_of_week"]
        verbose_name_plural = "opening hours"

    def __str__(self) -> str:
        day_name = dict(self.DAY_CHOICES).get(self.day_of_week, "?")
        return f"{self.salon.name} — {day_name} {self.open_time:%H:%M}–{self.close_time:%H:%M}"


class Employee(models.Model):
    """Employee working in a salon."""

    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name="employees")
    name = models.CharField(max_length=150)
    surname = models.CharField(max_length=150, blank=True)
    image = models.ImageField(upload_to="employees/", blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} {self.surname}".strip()


class Service(models.Model):
    """Service offered by a salon."""

    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name="services")
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    minutes_duration = models.PositiveIntegerField()

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.salon.name})"


class Review(models.Model):
    """Customer review / opinion for a salon."""

    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name="reviews")
    customer_name = models.CharField(max_length=255)
    customer_location = models.CharField(max_length=255, blank=True)
    rating = models.PositiveSmallIntegerField()
    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Review by {self.customer_name} for {self.salon.name}"
