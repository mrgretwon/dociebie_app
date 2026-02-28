from django.conf import settings
from django.db import models


class Appointment(models.Model):
    class Status(models.TextChoices):
        PAID = "paid", "Oplacono"
        UNPAID = "unpaid", "Nieoplacono"
        COMPLETED = "completed", "Zakończono"
        CANCELLED = "cancelled", "Anulowano"

    STATUS_DISPLAY = {
        "paid": {"text": "Oplacono", "is_status_alright": True},
        "unpaid": {"text": "Nieoplacono", "is_status_alright": False},
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
        default=Status.UNPAID,
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
