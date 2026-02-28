from django.conf import settings
from django.db import models


class Client(models.Model):
    """A client managed by a provider (may or may not be a registered user)."""

    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="provider_clients",
        limit_choices_to={"role": "provider"},
    )
    name = models.CharField(max_length=150)
    surname = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name", "surname"]

    def __str__(self) -> str:
        return f"{self.name} {self.surname}".strip()


class ClientGroup(models.Model):
    """A group of clients created by a provider."""

    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="client_groups",
        limit_choices_to={"role": "provider"},
    )
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to="client_groups/", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class ClientGroupMembership(models.Model):
    """Links a client to a client group."""

    group = models.ForeignKey(
        ClientGroup,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="group_memberships",
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("group", "client")
        ordering = ["added_at"]

    def __str__(self) -> str:
        return f"{self.client} in {self.group}"
