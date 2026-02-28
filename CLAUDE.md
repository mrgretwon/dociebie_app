# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Do Ciebie" (dociebie) — a Polish-language service booking mobile app (salon/service provider marketplace). Users browse salons, view services/reviews/details, book appointments, and manage their profile and visit history. Two user roles: **client** and **provider** (providers can own salons).

## Tech Stack

### Client Mobile App (`client_app/`)
- **Framework**: Expo SDK 54, React Native 0.81, React 19
- **Routing**: Expo Router v6 (file-based routing)
- **Language**: TypeScript
- **Fonts**: Nunito (Regular, SemiBold, Bold) via `@expo-google-fonts/nunito`
- **State**: React Context (`AuthContext`, `SalonsSearchContext`)
- **Auth storage**: `expo-secure-store` (stores JWT access + refresh tokens)
- **Toasts**: `toastify-react-native`
- **Node**: 24.11.1 (see `client_app/.nvmrc`)
- **New Architecture** + React Compiler enabled

### Provider Mobile App (`provider_app/`)
- **Framework**: Expo SDK 54, React Native 0.81, React 19 (same stack as client app)
- **Routing**: Expo Router v6 (file-based routing) with Drawer navigation
- **Language**: TypeScript
- **Image picker**: `expo-image-picker` (for employee/salon image uploads)
- **Toasts**: `toastify-react-native`
- **Node**: 24.11.1 (see `provider_app/.nvmrc`)

### Backend (`backend/`)
- **Framework**: Django 5.1 + Django REST Framework 3.15
- **Auth**: JWT via `djangorestframework-simplejwt` (60min access, 7d refresh)
- **Database**: PostgreSQL 16
- **Config**: `django-environ` with `.env` file
- **CORS**: `django-cors-headers` (allow-all in DEBUG)
- **Image handling**: Pillow + Django `ImageField`
- **Static files**: whitenoise (serves static files directly from gunicorn)
- **WSGI**: gunicorn

### Infrastructure
- **Docker Compose** (`docker-compose.yml` at project root): 2 services — `db` (PostgreSQL), `backend` (Django/gunicorn with whitenoise for static files)
- **Production**: User's own nginx proxies `/api/` and `/admin/` to gunicorn, serves `/media/` and `/static/` directly
- **Production URL**: `https://dociebie.pl/api/`
- **Local dev**: `http://localhost:8000/api/`

## Commands

### Backend (Docker)
```bash
docker compose up --build -d          # start all services
docker compose exec backend python manage.py seed_data     # seed sample data (10 salons, employees, reviews, etc.)
docker compose exec backend python manage.py seed_images   # download placeholder images for salons & employees
docker compose exec backend python manage.py migrate       # run migrations
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py shell         # Django interactive shell
docker compose logs -f backend        # tail backend logs
docker compose down                   # stop all
```

### Backend (local, without Docker)
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env                  # edit .env with local DB credentials
python manage.py migrate
python manage.py runserver            # http://localhost:8000
```

### Mobile App
```bash
cd client_app
npm install
npx expo start          # dev server
npx expo start --web    # web
npm run lint            # ESLint
```

### Provider App
```bash
cd provider_app
npm install
npx expo start          # dev server
npx expo start --web    # web
```

No test framework is configured in any project.

### Demo Credentials (after seed_data)
- Client: `demo@dociebie.pl` / `demo123`
- Provider: `provider@example.com` / `provider123`
- Provider 2: `provider2@example.com` / `provider123`
- Admin: `admin@example.com` / `admin123`

## Project Structure

### `backend/`
- `config/` — Django project settings (`settings.py`, `urls.py`, `wsgi.py`). Settings use `django-environ` to read from `backend/.env`.
- `apps/accounts/` — Custom `User` model (email-based auth, role field: client/provider), `EmailBackend`, JWT auth views (register, login, profile), serializers.
- `apps/salons/` — Models: `Category`, `Salon` (FK to provider User), `OpeningHours`, `Employee`, `Service`, `Review`. Salon `rating` is auto-calculated from reviews. Services are per-salon.
- `apps/appointments/` — `Appointment` model with status choices (paid/unpaid/completed/cancelled). Links user, salon, service, employee.
- `apps/provider/` — Provider-only API views. Uses `ProviderSalonMixin` to auto-resolve the authenticated provider's salon. Endpoints for managing salon details, services, employees, appointments, bank account, opening hours, reports, and available slots.
- `apps/salons/management/commands/seed_data.py` — Populates DB with 10 salons (diverse categories/cities), employees, services, reviews, and demo appointments.
- `apps/salons/management/commands/seed_images.py` — Downloads random placeholder images from picsum.photos for salons (2 per salon: 1 main + 1 shared for services/reviews/details) and employees (1 each).
- `.env.example` — Template for environment variables.
- `Dockerfile` — Python 3.12-slim, installs requirements, runs gunicorn.
- `entrypoint.sh` — Waits for PostgreSQL, runs migrations, collects static, starts gunicorn.

### `provider_app/`
- `app/` — Expo Router file-based routes with Drawer navigation. Route groups: `(auth)`, `(dashboard)`, `(account)`, `(calendar)`, `(clients)`, `(employees)`, `(finance)`, `(services)`, `(preview)`. Nested route: `(clients)/groups/`.
- `components/` — Shared components (Button, Header, Spinner, TextInputComponent, GoBackButton, HorizontalLine)
- `contexts/` — `AuthContext` (JWT auth, same pattern as client app)
- `services/api.ts` — Provider-specific API calls (salon management, services CRUD, employees CRUD, appointments, bank account, reports, opening hours, available slots)
- `constants/` — `api-config.ts`, `style-vars.ts`, `theme.ts` (shared design tokens with client app)

### `client_app/`
- `app/` — Expo Router file-based routes. Route groups: `(home)`, `(login)`, `(register)`, `(salons)`, `(appointment)`, `(appointment-confirmed)`, `(history)`, `(profile)`, `(user-data)`, `(payments)`. Nested route: `salon/` with sub-routes `details/`, `services/`, `reviews/`.
- `components/` — Shared reusable components (Button, Header, Spinner, TextInputComponent, SalonList, etc.)
- `contexts/` — `AuthContext` (JWT dual-token flow with auto-refresh), `SalonsSearchContext` (search filter state)
- `models/` — TypeScript interfaces and enums. `data-models/` has domain models + response DTOs (snake_case) with mapper functions.
- `services/api.ts` — All API calls to the Django backend. Uses `API_URL` from config. Helper functions: `request()`, `authenticatedRequest()` (auto-adds Bearer token).
- `constants/` — `api-config.ts` (base URL, auto-detects dev/prod via `__DEV__`), `style-vars.ts` (colors, font sizes), `theme.ts` (Colors/Fonts), `constants.ts`, `dummy-data.ts` (kept for reference)
- `hooks/use-translations.ts` — i18n hook using `assets/translations.json` (Polish locale, key-based)
- `assets/svg/` — SVG icon components as TSX

## API Endpoints

All under `/api/`:

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/auth/register/` | No | Returns `{access, refresh, user}` |
| POST | `/auth/login/` | No | Returns `{access, refresh, user}` |
| POST | `/auth/token/refresh/` | No | `{refresh}` → `{access}` |
| GET/PATCH | `/auth/profile/` | Bearer | View/update profile (incl. address fields) |
| GET | `/categories/` | No | Returns `[{id, name}]` |
| GET | `/salons/` | No | Query: `search`, `location`, `start_date`, `end_date` |
| GET | `/salons/{id}/` | No | Detail with employees, opening_hours |
| GET | `/salons/{id}/services/` | No | `[{id, name, price, minutes_duration}]` |
| GET | `/salons/{id}/reviews/` | No | `[{id, customer_name, customer_location, rating, date, text}]` |
| GET/POST | `/appointments/` | Bearer | List user's history / create appointment |
| GET | `/appointments/available-slots/` | Bearer | Query: `date`, `service_id`, `employee_id` |

### Provider API (under `/api/provider/`, Bearer required, provider role only)

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET/PATCH | `/salon/` | View/update provider's salon (supports multipart for image) |
| GET/POST | `/services/` | List/create salon services |
| GET/PATCH/DELETE | `/services/{id}/` | View/update/delete a service |
| GET/POST | `/employees/` | List/create salon employees |
| GET/PATCH/DELETE | `/employees/{id}/` | View/update/delete an employee (PATCH supports multipart for image) |
| GET/POST | `/appointments/` | List/create provider appointments |
| GET | `/bank-account/` | View salon bank account details |
| PATCH | `/bank-account/` | Update bank account details |
| GET/PUT | `/opening-hours/` | View/replace opening hours (PUT expects array) |
| POST | `/reports/` | Generate revenue report (`{start_date, end_date}`) |

## Key Patterns

- **API contract**: Backend returns snake_case JSON. Client models use camelCase. Mapper functions in `models/data-models/*.ts` (e.g., `salonModelFromResponseDto`, `appointmentModelFromResponseDto`) handle conversion. DRF `ImageField` returns absolute URLs; the `toFullUrl` helper in `salonModel.ts` handles both absolute and relative image URLs.
- **Auth flow**: JWT dual-token. `AuthContext` stores access + refresh tokens in SecureStore under separate keys. On 401, auto-attempts token refresh before logging out. Hydration on app launch tries stored token, falls back to refresh.
- **Styling**: Inline `StyleSheet.create()`. Colors/sizes from `constants/style-vars.ts`. Font families from `constants/theme.ts` (`Fonts.regular`, `Fonts.semiBold`, `Fonts.bold`).
- **i18n**: All user-facing strings use translation keys via `useTranslations()` hook. Polish-language app.
- **Salon search**: Currently text-based matching on salon name/address/city. Distance param accepted but not used (geocoding planned for later).
- **Django admin**: All models registered. Accessible at `/admin/`. Salon children (employees, services, reviews, opening hours) editable inline.
- **User model**: Custom `User` with `AUTH_USER_MODEL = "accounts.User"`. Email-based login via custom `EmailBackend`. Role field distinguishes client/provider. Provider users can own salons (Salon FK → User).
- **Images**: Salon components (`SalonPreview`, `ImageWithRoundedBottom`, `EmployeeInfoWithIcon`) display real images from the API with static asset fallbacks when no image is set.
- **Static files**: whitenoise middleware serves static files (category icons, admin assets) directly from gunicorn. Media files served by Django in DEBUG mode; in production, user's nginx serves `/media/`.
- **Environment config**: Backend uses `backend/.env` (gitignored). Copy `backend/.env.example` to get started. Mobile auto-detects via `__DEV__` — Android emulator uses Expo dev server host IP on port 8000, iOS/web uses `localhost:8000`, production uses `dociebie.pl`.
- **Provider app**: Separate Expo app for salon owners. Drawer-based navigation (not tabs). Uses `ProviderSalonMixin` backend pattern — all provider endpoints auto-resolve the salon from the authenticated user's ownership. Services and employees support full CRUD with image upload via multipart PATCH. Available slots are calculated server-side based on opening hours, service duration, and existing appointments.
- **Polish diacritics**: All UI strings in both apps must use proper Polish characters (ą, ć, ę, ł, ń, ó, ś, ź, ż). Provider app strings are hardcoded (not using i18n keys). Always check for missing diacritics when adding new Polish text.
