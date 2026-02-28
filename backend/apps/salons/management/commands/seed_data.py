"""
Management command to populate the database with sample data.
"""

import random
from datetime import datetime, time

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.provider.models import Client, ClientGroup, ClientGroupMembership
from apps.salons.models import Category, Employee, OpeningHours, Review, Salon, Service

User = get_user_model()

# ---------------------------------------------------------------------------
# Data pools
# ---------------------------------------------------------------------------
POLISH_FIRST_NAMES_F = [
    "Anna", "Katarzyna", "Magdalena", "Agnieszka", "Monika",
    "Aleksandra", "Natalia", "Karolina", "Joanna", "Marta",
    "Ewelina", "Dominika", "Paulina", "Patrycja", "Sylwia",
    "Justyna", "Beata", "Izabela", "Weronika", "Kamila",
]
POLISH_FIRST_NAMES_M = [
    "Tomasz", "Marcin", "Krzysztof", "Piotr", "Andrzej",
    "Jakub", "Kamil", "Michał", "Łukasz", "Adam",
    "Dawid", "Rafał", "Bartosz", "Damian", "Sebastian",
    "Mateusz", "Maciej", "Grzegorz", "Wojciech", "Robert",
]
POLISH_SURNAMES = [
    "Nowak", "Kowalski", "Wiśniewski", "Wójcik", "Kowalczyk",
    "Kamiński", "Lewandowski", "Zieliński", "Szymański", "Woźniak",
    "Dąbrowski", "Kozłowski", "Jankowski", "Mazur", "Kwiatkowski",
    "Krawczyk", "Piotrowska", "Grabowska", "Nowicka", "Pawłowska",
    "Michalska", "Adamczyk", "Dudek", "Zając", "Wieczorek",
]
POLISH_CITIES = [
    "Warszawa", "Kraków", "Wrocław", "Poznań", "Gdańsk",
    "Szczecin", "Łódź", "Katowice", "Lublin", "Bydgoszcz",
]
POLISH_STREETS = [
    "ul. Marszałkowska 12", "ul. Floriańska 8", "ul. Piotrkowska 45",
    "ul. Długa 22", "ul. Szeroka 5", "ul. Lipowa 17", "ul. Krakowska 33",
    "ul. Słoneczna 9", "ul. Ogrodowa 14", "ul. Parkowa 7",
    "al. Niepodległości 28", "ul. Mickiewicza 3", "ul. Piłsudskiego 19",
    "ul. Kościuszki 11", "ul. Sienkiewicza 6",
]
REVIEW_TEXTS = [
    "Bardzo profesjonalna obsługa, na pewno wrócę!",
    "Świetna atmosfera i miła obsługa. Polecam każdemu.",
    "Byłam tu pierwszy raz i jestem zachwycona efektem.",
    "Dobra jakość w rozsądnej cenie. Polecam.",
    "Trochę długo czekałam na wizytę, ale efekt końcowy świetny.",
    "Najlepsze miejsce w mieście! Chodzę tu od lat.",
    "Profesjonalne podejście do klienta, czysto i miło.",
    "Średnio. Oczekiwałem więcej za tę cenę.",
    "Rewelacja! Dokładnie to czego szukałem.",
    "Obsługa mogłaby być milsza, ale usługa ok.",
    "Polecam z całego serca, fantastyczny efekt!",
    "Nie jestem do końca zadowolony, ale nie było źle.",
    "Super! Już umówiłam się na kolejną wizytę.",
    "Fachowa robota, terminowo i bez problemów.",
    "Bardzo czysto, nowocześnie i profesjonalnie.",
]

# ---------------------------------------------------------------------------
# Salon definitions — 10 diverse salons
# ---------------------------------------------------------------------------
SALONS_DATA = [
    {
        "name": "Barber Shop Gentlemen",
        "category": "Barber",
        "city": "Warszawa",
        "street": "ul. Marszałkowska 42",
        "phone": "+48 22 123 45 67",
        "mail": "kontakt@gentlemen-barber.pl",
        "hours": [
            (0, time(9, 0), time(20, 0)),
            (1, time(9, 0), time(20, 0)),
            (2, time(9, 0), time(20, 0)),
            (3, time(9, 0), time(20, 0)),
            (4, time(9, 0), time(20, 0)),
            (5, time(10, 0), time(18, 0)),
        ],
        "employees": [
            ("Tomasz", "Nowak"), ("Marcin", "Kowalski"), ("Kamil", "Zieliński"),
        ],
        "services": [
            ("Strzyżenie męskie", 60, 30),
            ("Strzyżenie brody", 40, 20),
            ("Strzyżenie + broda", 90, 45),
            ("Golenie brzytwą", 50, 25),
            ("Stylizacja włosów", 35, 15),
        ],
    },
    {
        "name": "Oaza Relaksu SPA",
        "category": "SPA",
        "city": "Kraków",
        "street": "ul. Floriańska 15",
        "phone": "+48 12 654 32 10",
        "mail": "rezerwacje@oazarelaksu.pl",
        "hours": [
            (0, time(10, 0), time(21, 0)),
            (1, time(10, 0), time(21, 0)),
            (2, time(10, 0), time(21, 0)),
            (3, time(10, 0), time(21, 0)),
            (4, time(10, 0), time(21, 0)),
            (5, time(10, 0), time(19, 0)),
            (6, time(10, 0), time(19, 0)),
        ],
        "employees": [
            ("Katarzyna", "Wiśniewska"), ("Monika", "Dąbrowska"),
            ("Aleksandra", "Kozłowska"), ("Natalia", "Szymańska"),
        ],
        "services": [
            ("Masaż relaksacyjny 60 min", 180, 60),
            ("Masaż gorącymi kamieniami", 220, 75),
            ("Rytuał SPA dla dwojga", 450, 120),
            ("Sauna + masaż", 250, 90),
            ("Peeling ciała", 120, 45),
            ("Aromaterapia", 150, 50),
        ],
    },
    {
        "name": "Studio Paznokci Glamour",
        "category": "Beauty",
        "city": "Wrocław",
        "street": "ul. Świdnicka 28",
        "phone": "+48 71 234 56 78",
        "mail": "glamour@paznokcie.pl",
        "hours": [
            (0, time(9, 0), time(17, 0)),
            (1, time(9, 0), time(17, 0)),
            (2, time(9, 0), time(17, 0)),
            (3, time(9, 0), time(19, 0)),
            (4, time(9, 0), time(19, 0)),
            (5, time(10, 0), time(15, 0)),
        ],
        "employees": [
            ("Paulina", "Kwiatkowska"), ("Ewelina", "Grabowska"),
        ],
        "services": [
            ("Manicure hybrydowy", 80, 45),
            ("Pedicure klasyczny", 90, 50),
            ("Żelowe przedłużanie", 150, 90),
            ("Zdobienia paznokci", 30, 20),
            ("Manicure japoński", 100, 40),
        ],
    },
    {
        "name": "Czysty Dom Serwis",
        "category": "Sprzątanie",
        "city": "Poznań",
        "street": "ul. Święty Marcin 33",
        "phone": "+48 61 876 54 32",
        "mail": "biuro@czystydom.pl",
        "hours": [
            (0, time(7, 0), time(18, 0)),
            (1, time(7, 0), time(18, 0)),
            (2, time(7, 0), time(18, 0)),
            (3, time(7, 0), time(18, 0)),
            (4, time(7, 0), time(18, 0)),
            (5, time(8, 0), time(14, 0)),
        ],
        "employees": [
            ("Justyna", "Pawłowska"), ("Beata", "Nowicka"),
            ("Sylwia", "Michalska"), ("Izabela", "Adamczyk"),
            ("Kamila", "Wieczorek"),
        ],
        "services": [
            ("Sprzątanie mieszkania do 50m²", 150, 120),
            ("Sprzątanie mieszkania do 100m²", 250, 180),
            ("Mycie okien (do 10 szt.)", 120, 90),
            ("Pranie tapicerki", 200, 120),
            ("Sprzątanie po remoncie", 400, 300),
        ],
    },
    {
        "name": "Hydro-Fix Instalacje",
        "category": "Hydraulika",
        "city": "Gdańsk",
        "street": "ul. Długi Targ 8",
        "phone": "+48 58 345 67 89",
        "mail": "serwis@hydrofix.pl",
        "hours": [
            (0, time(8, 0), time(17, 0)),
            (1, time(8, 0), time(17, 0)),
            (2, time(8, 0), time(17, 0)),
            (3, time(8, 0), time(17, 0)),
            (4, time(8, 0), time(17, 0)),
            (5, time(9, 0), time(13, 0)),
        ],
        "employees": [
            ("Piotr", "Lewandowski"), ("Andrzej", "Mazur"),
            ("Robert", "Dudek"),
        ],
        "services": [
            ("Udrażnianie rur", 150, 60),
            ("Montaż baterii", 120, 45),
            ("Wymiana syfonu", 80, 30),
            ("Podłączenie pralki/zmywarki", 100, 40),
            ("Naprawa spłuczki", 90, 35),
            ("Przegląd instalacji", 200, 90),
        ],
    },
    {
        "name": "Auto Serwis Turbo",
        "category": "Mechanik",
        "city": "Katowice",
        "street": "ul. Chorzowska 55",
        "phone": "+48 32 456 78 90",
        "mail": "turbo@autoserwis.pl",
        "hours": [
            (0, time(7, 0), time(18, 0)),
            (1, time(7, 0), time(18, 0)),
            (2, time(7, 0), time(18, 0)),
            (3, time(7, 0), time(18, 0)),
            (4, time(7, 0), time(18, 0)),
            (5, time(8, 0), time(14, 0)),
        ],
        "employees": [
            ("Grzegorz", "Krawczyk"), ("Wojciech", "Jankowski"),
            ("Dawid", "Zając"), ("Sebastian", "Wójcik"),
        ],
        "services": [
            ("Wymiana oleju + filtr", 120, 30),
            ("Wymiana klocków hamulcowych", 200, 60),
            ("Diagnostyka komputerowa", 100, 30),
            ("Wymiana rozrządu", 800, 240),
            ("Geometria kół", 150, 45),
            ("Wymiana opon (4 szt.)", 80, 30),
            ("Klimatyzacja – serwis", 180, 60),
        ],
    },
    {
        "name": "Foto Studio Kreatyw",
        "category": "Foto",
        "city": "Łódź",
        "street": "ul. Piotrkowska 120",
        "phone": "+48 42 567 89 01",
        "mail": "sesje@kreatyw.pl",
        "hours": [
            (0, time(10, 0), time(18, 0)),
            (1, time(10, 0), time(18, 0)),
            (2, time(10, 0), time(18, 0)),
            (3, time(10, 0), time(18, 0)),
            (4, time(10, 0), time(18, 0)),
            (5, time(10, 0), time(16, 0)),
        ],
        "employees": [
            ("Marta", "Jankowska"), ("Jakub", "Kowalczyk"),
        ],
        "services": [
            ("Sesja portretowa (1h)", 300, 60),
            ("Sesja rodzinna (2h)", 500, 120),
            ("Reportaż ślubny", 3500, 480),
            ("Zdjęcia produktowe (10 szt.)", 400, 90),
            ("Sesja biznesowa", 350, 60),
        ],
    },
    {
        "name": "Beauty Bar Kleopatra",
        "category": "Beauty",
        "city": "Lublin",
        "street": "ul. Krakowskie Przedmieście 7",
        "phone": "+48 81 678 90 12",
        "mail": "kleopatra@beautybar.pl",
        "hours": [
            (0, time(9, 0), time(20, 0)),
            (1, time(9, 0), time(20, 0)),
            (2, time(9, 0), time(20, 0)),
            (3, time(9, 0), time(20, 0)),
            (4, time(9, 0), time(20, 0)),
            (5, time(9, 0), time(16, 0)),
        ],
        "employees": [
            ("Dominika", "Piotrowska"), ("Weronika", "Mazur"),
            ("Joanna", "Szymańska"),
        ],
        "services": [
            ("Makijaż dzienny", 120, 40),
            ("Makijaż wieczorowy", 180, 60),
            ("Henna brwi i rzęs", 60, 25),
            ("Lifting rzęs", 130, 50),
            ("Regulacja brwi", 30, 15),
            ("Peeling kawitacyjny", 90, 40),
            ("Oczyszczanie manualne", 160, 60),
        ],
    },
    {
        "name": "Złota Rączka Express",
        "category": "Hydraulika",
        "city": "Bydgoszcz",
        "street": "ul. Gdańska 18",
        "phone": "+48 52 789 01 23",
        "mail": "zlotaraczka@express.pl",
        "hours": [
            (0, time(8, 0), time(18, 0)),
            (1, time(8, 0), time(18, 0)),
            (2, time(8, 0), time(18, 0)),
            (3, time(8, 0), time(18, 0)),
            (4, time(8, 0), time(18, 0)),
            (5, time(9, 0), time(14, 0)),
        ],
        "employees": [
            ("Łukasz", "Woźniak"), ("Adam", "Kamiński"),
            ("Rafał", "Dąbrowski"),
        ],
        "services": [
            ("Wymiana kranu", 100, 30),
            ("Montaż WC", 250, 90),
            ("Instalacja ogrzewania podłogowego (m²)", 80, 60),
            ("Naprawa przecieku", 130, 45),
            ("Wymiana grzejnika", 300, 120),
        ],
    },
    {
        "name": "SPA Harmonia",
        "category": "SPA",
        "city": "Szczecin",
        "street": "ul. Wojska Polskiego 22",
        "phone": "+48 91 890 12 34",
        "mail": "harmonia@spa.pl",
        "hours": [
            (0, time(10, 0), time(20, 0)),
            (1, time(10, 0), time(20, 0)),
            (2, time(10, 0), time(20, 0)),
            (3, time(10, 0), time(20, 0)),
            (4, time(10, 0), time(22, 0)),
            (5, time(9, 0), time(20, 0)),
            (6, time(9, 0), time(20, 0)),
        ],
        "employees": [
            ("Agnieszka", "Lewandowska"), ("Karolina", "Zielińska"),
            ("Magdalena", "Kowalczyk"), ("Patrycja", "Nowak"),
        ],
        "services": [
            ("Masaż tajski", 200, 60),
            ("Masaż lomi-lomi", 240, 75),
            ("Kąpiel w płatkach róż", 180, 45),
            ("Rytuał czekoladowy", 280, 90),
            ("Refleksologia stóp", 120, 40),
            ("Masaż bambusami", 220, 60),
        ],
    },
]


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

        # --- Provider users (one per salon) ---
        OWNER_DATA = [
            {"email": "owner1@dociebie.pl", "name": "Marek", "surname": "Wiśniewski", "city": "Warszawa", "street": "ul. Marszałkowska 42", "postal_code": "00-042"},
            {"email": "owner2@dociebie.pl", "name": "Ewa", "surname": "Kowalska", "city": "Kraków", "street": "ul. Floriańska 15", "postal_code": "31-019"},
            {"email": "owner3@dociebie.pl", "name": "Anna", "surname": "Kwiatkowska", "city": "Wrocław", "street": "ul. Świdnicka 28", "postal_code": "50-067"},
            {"email": "owner4@dociebie.pl", "name": "Piotr", "surname": "Pawłowski", "city": "Poznań", "street": "ul. Święty Marcin 33", "postal_code": "61-806"},
            {"email": "owner5@dociebie.pl", "name": "Tomasz", "surname": "Lewandowski", "city": "Gdańsk", "street": "ul. Długi Targ 8", "postal_code": "80-831"},
            {"email": "owner6@dociebie.pl", "name": "Grzegorz", "surname": "Krawczyk", "city": "Katowice", "street": "ul. Chorzowska 55", "postal_code": "40-121"},
            {"email": "owner7@dociebie.pl", "name": "Marta", "surname": "Jankowska", "city": "Łódź", "street": "ul. Piotrkowska 120", "postal_code": "90-006"},
            {"email": "owner8@dociebie.pl", "name": "Dominika", "surname": "Piotrowska", "city": "Lublin", "street": "ul. Krakowskie Przedmieście 7", "postal_code": "20-002"},
            {"email": "owner9@dociebie.pl", "name": "Łukasz", "surname": "Woźniak", "city": "Bydgoszcz", "street": "ul. Gdańska 18", "postal_code": "85-005"},
            {"email": "owner10@dociebie.pl", "name": "Agnieszka", "surname": "Zielińska", "city": "Szczecin", "street": "ul. Wojska Polskiego 22", "postal_code": "70-473"},
        ]

        providers = []
        for od in OWNER_DATA:
            owner, _ = User.objects.get_or_create(
                email=od["email"],
                defaults={
                    "name": od["name"],
                    "surname": od["surname"],
                    "role": "provider",
                    "street": od["street"],
                    "city": od["city"],
                    "postal_code": od["postal_code"],
                },
            )
            if not owner.has_usable_password():
                owner.set_password("provider123")
                owner.save()
            providers.append(owner)

        # --- Demo client user ---
        client_user, _ = User.objects.get_or_create(
            email="demo@dociebie.pl",
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
            client_user.set_password("demo123")
            client_user.save()

        # --- Categories ---
        categories = {}
        cat_defs = [
            ("Barber", "scissors"),
            ("SPA", "heart"),
            ("Beauty", "sparkles"),
            ("Sprzątanie", "home"),
            ("Hydraulika", "wrench"),
            ("Mechanik", "car"),
            ("Foto", "camera"),
        ]
        for cat_name, icon in cat_defs:
            cat, _ = Category.objects.get_or_create(
                name=cat_name,
                defaults={"icon": icon},
            )
            categories[cat_name] = cat

        # --- 10 Salons ---
        salons = []
        for i, data in enumerate(SALONS_DATA):
            cat = categories.get(data["category"])
            owner = providers[i]

            salon, created = Salon.objects.get_or_create(
                name=data["name"],
                defaults={
                    "owner": owner,
                    "category": cat,
                    "location_name": f"{data['street']}, {data['city']}",
                    "phone_number": data["phone"],
                    "mail": data["mail"],
                },
            )
            salons.append(salon)

            if not created:
                self.stdout.write(f"  Salon already exists: {salon.name}")
                continue

            self.stdout.write(self.style.SUCCESS(f"  Created salon: {salon.name}"))

            # Opening hours
            for day_of_week, open_time, close_time in data["hours"]:
                OpeningHours.objects.create(
                    salon=salon,
                    day_of_week=day_of_week,
                    open_time=open_time,
                    close_time=close_time,
                )

            # Employees
            for emp_name, emp_surname in data["employees"]:
                Employee.objects.create(
                    salon=salon, name=emp_name, surname=emp_surname
                )

            # Services
            for svc_name, price, duration in data["services"]:
                Service.objects.create(
                    salon=salon,
                    name=svc_name,
                    price=price,
                    minutes_duration=duration,
                )

            # Reviews (2–5 random reviews per salon)
            num_reviews = random.randint(2, 5)
            used_names = set()
            for _ in range(num_reviews):
                first = random.choice(POLISH_FIRST_NAMES_F + POLISH_FIRST_NAMES_M)
                last = random.choice(POLISH_SURNAMES)
                full_name = f"{first} {last}"
                while full_name in used_names:
                    first = random.choice(POLISH_FIRST_NAMES_F + POLISH_FIRST_NAMES_M)
                    last = random.choice(POLISH_SURNAMES)
                    full_name = f"{first} {last}"
                used_names.add(full_name)

                Review.objects.create(
                    salon=salon,
                    customer_name=full_name,
                    customer_location=f"{random.choice(POLISH_CITIES)}, Polska",
                    rating=random.choices([5, 4, 3, 2, 1], weights=[40, 30, 15, 10, 5])[0],
                    text=random.choice(REVIEW_TEXTS),
                )

        # --- Geocoordinates for seeded salons ---
        CITY_COORDS = {
            "Szczecin": (53.4285, 14.5528),
            "Warszawa": (52.2297, 21.0122),
            "Kraków": (50.0647, 19.9450),
            "Gdańsk": (54.3520, 18.6466),
            "Poznań": (52.4064, 16.9252),
            "Wrocław": (51.1079, 17.0385),
            "Łódź": (51.7592, 19.4560),
            "Katowice": (50.2649, 19.0238),
            "Lublin": (51.2465, 22.5684),
            "Bydgoszcz": (53.1235, 18.0084),
        }
        for i, salon in enumerate(salons):
            city = SALONS_DATA[i]["city"]
            base = CITY_COORDS.get(city)
            if base and salon.latitude is None:
                salon.latitude = base[0] + random.uniform(-0.01, 0.01)
                salon.longitude = base[1] + random.uniform(-0.01, 0.01)
                salon.save(update_fields=["latitude", "longitude"])
        self.stdout.write(self.style.SUCCESS("  Salon coordinates set."))

        # --- Appointments for demo user ---
        salon = salons[0]
        employees = list(salon.employees.all())
        services = list(salon.services.all())

        if not Appointment.objects.filter(user=client_user).exists() and employees and services:
            svc = services[0]
            Appointment.objects.create(
                user=client_user,
                salon=salon,
                service=svc,
                employee=employees[0],
                date=timezone.make_aware(datetime(2025, 3, 1, 15, 30)),
                status="paid",
            )
            Appointment.objects.create(
                user=client_user,
                salon=salon,
                service=svc,
                employee=employees[1 % len(employees)],
                date=timezone.make_aware(datetime(2025, 3, 3, 8, 30)),
                status="unpaid",
            )
            Appointment.objects.create(
                user=client_user,
                salon=salon,
                service=svc,
                employee=employees[2 % len(employees)],
                date=timezone.make_aware(datetime(2025, 2, 15, 12, 30)),
                status="completed",
            )

        # --- Subscription data for some salons ---
        for i, salon in enumerate(salons):
            if not salon.subscription_active and i < 5:
                salon.subscription_active = True
                salon.subscription_expiry = timezone.now().date() + timezone.timedelta(days=random.randint(30, 365))
                salon.bank_name = random.choice(["PKO BP", "mBank", "ING", "Santander", "BNP Paribas"])
                salon.bank_account_number = f"PL{random.randint(10, 99)} {random.randint(1000, 9999)} {random.randint(1000, 9999)} {random.randint(1000, 9999)} {random.randint(1000, 9999)} {random.randint(1000, 9999)} {random.randint(1000, 9999)}"
                salon.bank_holder_name = f"{providers[i].name} {providers[i].surname}"
                salon.save()
        self.stdout.write(self.style.SUCCESS("  Subscription data added."))

        # --- Provider clients and groups ---
        for i, provider in enumerate(providers):
            if Client.objects.filter(provider=provider).exists():
                continue

            # Create 3-6 clients per provider
            num_clients = random.randint(3, 6)
            created_clients = []
            for _ in range(num_clients):
                first = random.choice(POLISH_FIRST_NAMES_F + POLISH_FIRST_NAMES_M)
                last = random.choice(POLISH_SURNAMES)
                client = Client.objects.create(
                    provider=provider,
                    name=first,
                    surname=last,
                    email=f"{first.lower()}.{last.lower()}@example.com",
                    phone=f"+48 {random.randint(500, 799)} {random.randint(100, 999)} {random.randint(100, 999)}",
                    notes=random.choice(["", "Stały klient", "Preferuje wizyty popołudniowe", "Uczulenie na niektóre produkty"]),
                )
                created_clients.append(client)

            # Create 1-2 client groups per provider
            group_names = ["VIP", "Stali klienci", "Nowi klienci", "Firmowi"]
            for gname in random.sample(group_names, k=min(2, len(group_names))):
                group = ClientGroup.objects.create(
                    provider=provider,
                    name=gname,
                )
                # Add random clients to group
                for client in random.sample(created_clients, k=min(random.randint(1, 3), len(created_clients))):
                    ClientGroupMembership.objects.get_or_create(
                        group=group, client=client
                    )

        self.stdout.write(self.style.SUCCESS("  Provider clients and groups created."))

        self.stdout.write(self.style.SUCCESS("  Database seeded successfully!"))
