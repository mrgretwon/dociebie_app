"""
Management command to download category-appropriate placeholder images for salons
and AI-generated face photos for employees.

Uses loremflickr.com for keyword-based salon images
and thispersondoesnotexist.com for employee face photos.
"""

import urllib.request
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from apps.salons.models import Employee, Salon

# Category name → search keywords for loremflickr.com
CATEGORY_KEYWORDS = {
    "Barber": "barber,barbershop",
    "SPA": "spa,wellness",
    "Beauty": "beauty,salon",
    "Sprzątanie": "cleaning,service",
    "Hydraulika": "plumber,plumbing",
    "Mechanik": "mechanic,car-repair",
    "Foto": "photography,studio",
}

LOREMFLICKR_URL = "https://loremflickr.com/{width}/{height}/{keywords}"
THISPERSON_URL = "https://thispersondoesnotexist.com"


def download_image(url):
    """Download an image from the given URL."""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def download_salon_image(width, height, category_name):
    """Download a category-appropriate image from loremflickr.com."""
    keywords = CATEGORY_KEYWORDS.get(category_name, "business,office")
    url = LOREMFLICKR_URL.format(width=width, height=height, keywords=keywords)
    return download_image(url)


def download_face_image():
    """Download an AI-generated face photo from thispersondoesnotexist.com."""
    return download_image(THISPERSON_URL)


class Command(BaseCommand):
    help = "Download category-appropriate images for salons and AI face photos for employees."

    def handle(self, *args, **options):
        salons = Salon.objects.select_related("category").all()
        self.stdout.write(f"Generating images for {salons.count()} salons ...")

        for salon in salons:
            category_name = salon.category.name if salon.category else ""

            # main_image
            if not salon.main_image:
                try:
                    data = download_salon_image(800, 600, category_name)
                    salon.main_image.save(
                        f"{salon.pk}_main.jpg", ContentFile(data), save=False
                    )
                    self.stdout.write(self.style.SUCCESS(
                        f"  {salon.name} — main_image ({category_name}) ✓"
                    ))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(
                        f"  {salon.name} — main_image FAILED: {e}"
                    ))

            salon.save()

        employees = Employee.objects.all()
        self.stdout.write(f"\nGenerating images for {employees.count()} employees ...")

        for emp in employees:
            if emp.image:
                self.stdout.write(f"  {emp} — already set, skipping")
                continue
            try:
                data = download_face_image()
                filename = f"emp_{emp.pk}.jpg"
                emp.image.save(filename, ContentFile(data), save=True)
                self.stdout.write(self.style.SUCCESS(f"  {emp} ✓"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  {emp} FAILED: {e}"))

        self.stdout.write(self.style.SUCCESS("\nDone!"))
