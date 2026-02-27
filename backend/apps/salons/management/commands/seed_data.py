"""
Management command to populate the database with sample data
matching the client-side dummy-data.ts.
"""

from datetime import datetime

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.salons.models import Category, Employee, OpeningHours, Review, Salon, Service

User = get_user_model()


class Command(BaseCommand):
    help = "Seed the database with sample data (salons, services, employees, reviews, appointments)."

    def handle(self, *args, **options):
        self.stdout.write("Seeding database ...")

        # --- Superuser ---
        import environ

        env = environ.Env()
        su_email = env("DJANGO_SUPERUSER_EMAIL", default="admin@example.com")
        su_password = env("DJANGO_SUPERUSER_PASSWORD", default="admin123")

        if not User.objects.filter(email=su_email).exists():
            User.objects.create_superuser(
                email=su_email,
                password=su_password,
                name="Admin",
                surname="Admin",
            )
            self.stdout.write(self.style.SUCCESS(f"  Superuser created: {su_email}"))
        else:
            self.stdout.write(f"  Superuser already exists: {su_email}")

        # --- Provider user ---
        provider, _ = User.objects.get_or_create(
            email="provider@example.com",
            defaults={
                "name": "Provider",
                "surname": "User",
                "role": "provider",
                "street": "Dluga 10a",
                "city": "Szczecin",
                "postal_code": "70-001",
            },
        )
        if not provider.has_usable_password():
            provider.set_password("provider123")
            provider.save()

        # --- Demo client user ---
        client_user, _ = User.objects.get_or_create(
            email="demo@example.com",
            defaults={
                "name": "Jan",
                "surname": "Kowalski",
                "role": "client",
                "street": "Lipowa 1",
                "city": "Warszawa",
                "postal_code": "00-001",
            },
        )
        if not client_user.has_usable_password():
            client_user.set_password("demo1234")
            client_user.save()

        # --- Categories ---
        cat_barber, _ = Category.objects.get_or_create(name="Barber")
        Category.objects.get_or_create(name="SPA")
        Category.objects.get_or_create(name="Nails")
        Category.objects.get_or_create(name="Hair")
        Category.objects.get_or_create(name="Beauty")

        # --- Salons (5 samples) ---
        salons = []
        for i in range(5):
            salon, _ = Salon.objects.get_or_create(
                name=f"Salon u sasiada {i}",
                defaults={
                    "owner": provider,
                    "category": cat_barber,
                    "location_name": "ul. Dluga 10a, Szczecin",
                    "phone_number": "+48 726 123 456",
                    "mail": "kontakt@salon.pl",
                },
            )
            salons.append(salon)

            # Opening hours
            if not salon.opening_hours.exists():
                OpeningHours.objects.create(salon=salon, text="Pon-Pt od 9:00 do 17:00", order=0)
                OpeningHours.objects.create(salon=salon, text="Sob od 9:00 do 15:00", order=1)

            # Employees
            if not salon.employees.exists():
                Employee.objects.create(salon=salon, name="Marysia", surname="Kowalska")
                Employee.objects.create(salon=salon, name="Jan", surname="Pawlowski")
                Employee.objects.create(salon=salon, name="Jan", surname="Malinowski")

            # Services
            if not salon.services.exists():
                Service.objects.create(
                    salon=salon, name="Masaz twarzy", price=50, minutes_duration=35
                )
                Service.objects.create(
                    salon=salon, name="KOBIDO", price=200, minutes_duration=55
                )
                Service.objects.create(
                    salon=salon, name="Peeling kawitacyjny", price=45, minutes_duration=45
                )
                Service.objects.create(
                    salon=salon, name="Oczyszczanie", price=180, minutes_duration=60
                )
                Service.objects.create(
                    salon=salon, name="Sonofereza", price=140, minutes_duration=15
                )

            # Reviews
            if not salon.reviews.exists():
                Review.objects.create(
                    salon=salon,
                    customer_name="Marianna Kowalska",
                    customer_location="Poznan, Polska",
                    rating=5,
                    text="Wizyta bardzo udana. Henna rzes i brwi oraz regulacja zrobione bardzo starannie i estetycznie, tak samo wosk.",
                )
                Review.objects.create(
                    salon=salon,
                    customer_name="Janusz Maj",
                    customer_location="Poznan, Polska",
                    rating=4,
                    text="Polecam",
                )
                Review.objects.create(
                    salon=salon,
                    customer_name="Jan Kowalski",
                    customer_location="Poznan, Polska",
                    rating=5,
                    text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur dolor sem, aliquam sed felis in, scelerisque pellentesque risus.",
                )
                Review.objects.create(
                    salon=salon,
                    customer_name="Agata Meble",
                    customer_location="Szczecin, Polska",
                    rating=1,
                    text="Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                )

        # --- Appointments for demo user ---
        salon = salons[0]
        employees = list(salon.employees.all())
        services = list(salon.services.all())

        if not Appointment.objects.filter(user=client_user).exists() and employees and services:
            oczyszczanie = next((s for s in services if "Oczyszczanie" in s.name), services[0])

            Appointment.objects.create(
                user=client_user,
                salon=salon,
                service=oczyszczanie,
                employee=employees[0],
                date=timezone.make_aware(datetime(2022, 10, 1, 15, 30)),
                status="paid",
            )
            Appointment.objects.create(
                user=client_user,
                salon=salon,
                service=oczyszczanie,
                employee=employees[1] if len(employees) > 1 else employees[0],
                date=timezone.make_aware(datetime(2022, 10, 3, 8, 30)),
                status="unpaid",
            )
            Appointment.objects.create(
                user=client_user,
                salon=salon,
                service=oczyszczanie,
                employee=employees[2] if len(employees) > 2 else employees[0],
                date=timezone.make_aware(datetime(2022, 10, 5, 12, 30)),
                status="paid",
            )
            Appointment.objects.create(
                user=client_user,
                salon=salon,
                service=oczyszczanie,
                employee=employees[0],
                date=timezone.make_aware(datetime(2021, 10, 1, 12, 30)),
                status="completed",
            )

        self.stdout.write(self.style.SUCCESS("  Database seeded successfully!"))
