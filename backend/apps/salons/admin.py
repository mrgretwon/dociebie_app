from django.contrib import admin

from .models import Category, Employee, OpeningHours, Review, Salon, Service


class OpeningHoursInline(admin.TabularInline):
    model = OpeningHours
    extra = 1


class EmployeeInline(admin.TabularInline):
    model = Employee
    extra = 1


class ServiceInline(admin.TabularInline):
    model = Service
    extra = 1


class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Salon)
class SalonAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "category", "owner", "location_name")
    list_filter = ("category",)
    search_fields = ("name", "location_name")
    inlines = [OpeningHoursInline, EmployeeInline, ServiceInline, ReviewInline]


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "surname", "salon")
    list_filter = ("salon",)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "price", "minutes_duration", "salon")
    list_filter = ("salon",)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "customer_name", "rating", "salon", "created_at")
    list_filter = ("rating", "salon")
