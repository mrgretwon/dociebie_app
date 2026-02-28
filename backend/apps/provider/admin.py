from django.contrib import admin

from .models import Client, ClientGroup, ClientGroupMembership


class ClientGroupMembershipInline(admin.TabularInline):
    model = ClientGroupMembership
    extra = 0
    raw_id_fields = ("client",)


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "surname", "email", "phone", "provider", "created_at")
    list_filter = ("provider",)
    search_fields = ("name", "surname", "email", "phone")


@admin.register(ClientGroup)
class ClientGroupAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "provider", "created_at")
    list_filter = ("provider",)
    search_fields = ("name",)
    inlines = [ClientGroupMembershipInline]


@admin.register(ClientGroupMembership)
class ClientGroupMembershipAdmin(admin.ModelAdmin):
    list_display = ("id", "group", "client", "added_at")
    list_filter = ("group",)
