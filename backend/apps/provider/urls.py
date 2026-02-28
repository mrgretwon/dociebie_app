from django.urls import path

from . import views

app_name = "provider"

urlpatterns = [
    # Salon
    path("salon/", views.ProviderSalonView.as_view(), name="salon"),
    path("salon/opening-hours/", views.ProviderOpeningHoursView.as_view(), name="opening-hours"),
    path("salon/opening-hours/<int:pk>/", views.ProviderOpeningHoursDeleteView.as_view(), name="opening-hours-delete"),
    path("salon/subscription/", views.ProviderSubscriptionView.as_view(), name="subscription"),
    path("salon/bank-account/", views.ProviderBankAccountView.as_view(), name="bank-account"),

    # Employees
    path("employees/", views.ProviderEmployeeListCreateView.as_view(), name="employee-list"),
    path("employees/<int:pk>/", views.ProviderEmployeeDetailView.as_view(), name="employee-detail"),

    # Services
    path("services/", views.ProviderServiceListCreateView.as_view(), name="service-list"),
    path("services/<int:pk>/", views.ProviderServiceDetailView.as_view(), name="service-detail"),

    # Clients
    path("clients/", views.ProviderClientListCreateView.as_view(), name="client-list"),
    path("clients/<int:pk>/", views.ProviderClientDetailView.as_view(), name="client-detail"),
    path("clients/<int:pk>/visits/", views.ProviderClientVisitsView.as_view(), name="client-visits"),

    # Client groups
    path("client-groups/", views.ProviderClientGroupListCreateView.as_view(), name="client-group-list"),
    path("client-groups/<int:pk>/", views.ProviderClientGroupDetailView.as_view(), name="client-group-detail"),
    path("client-groups/<int:pk>/members/", views.ProviderClientGroupMemberAddView.as_view(), name="client-group-member-add"),
    path("client-groups/<int:group_id>/members/<int:client_id>/", views.ProviderClientGroupMemberRemoveView.as_view(), name="client-group-member-remove"),

    # Appointments
    path("appointments/", views.ProviderAppointmentListCreateView.as_view(), name="appointment-list"),
    path("appointments/pending-count/", views.ProviderPendingCountView.as_view(), name="appointment-pending-count"),
    path("appointments/available-slots/", views.ProviderAvailableSlotsView.as_view(), name="available-slots"),
    path("appointments/<int:pk>/", views.ProviderAppointmentDetailView.as_view(), name="appointment-detail"),

    # Financial
    path("financial-summary/", views.ProviderFinancialSummaryView.as_view(), name="financial-summary"),
    path("payment-history/", views.ProviderPaymentHistoryView.as_view(), name="payment-history"),
    path("reports/", views.ProviderReportView.as_view(), name="reports"),
]
