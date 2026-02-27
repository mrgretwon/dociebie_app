from django.urls import path

from . import views

app_name = "appointments"

urlpatterns = [
    path("appointments/", views.AppointmentListCreateView.as_view(), name="appointment-list"),
]
