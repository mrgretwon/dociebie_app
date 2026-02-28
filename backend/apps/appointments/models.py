from django.conf import settings
from django.db import models


class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Oczekuje"
        CONFIRMED = "confirmed", "Potwierdzona"
        PAID = "paid", "Opłacono"
        UNPAID = "unpaid", "Nieopłacono"
        COMPLETED = "completed", "Zakończono"
        CANCELLED = "cancelled", "Anulowano"

    STATUS_DISPLAY = {
        "pending": {"text": "Oczekuje", "is_status_alright": False},
        "confirmed": {"text": "Potwierdzona", "is_status_alright": True},
        "paid": {"text": "Opłacono", "is_status_alright": True},
        "unpaid": {"text": "Nieopłacono", "is_status_alright": False},
        "completed": {"text": "Zakończono", "is_status_alright": True},
        "cancelled": {"text": "Anulowano", "is_status_alright": False},
    }

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    salon = models.ForeignKey(
        "salons.Salon",
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    service = models.ForeignKey(
        "salons.Service",
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    employee = models.ForeignKey(
        "salons.Employee",
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    date = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self) -> str:
        return f"Appointment #{self.pk} — {self.user.email} @ {self.salon.name}"

    @property
    def status_detail(self) -> dict:
        info = self.STATUS_DISPLAY.get(self.status, {})
        return {
            "id": list(self.Status.values).index(self.status) + 1,
            "text": info.get("text", self.status),
            "is_status_alright": info.get("is_status_alright", True),
        }
