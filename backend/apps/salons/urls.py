from django.urls import path

from . import views

app_name = "salons"

urlpatterns = [
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("salons/", views.SalonListView.as_view(), name="salon-list"),
    path("salons/<int:pk>/", views.SalonDetailView.as_view(), name="salon-detail"),
    path("salons/<int:pk>/services/", views.SalonServicesView.as_view(), name="salon-services"),
    path("salons/<int:pk>/reviews/", views.SalonReviewsView.as_view(), name="salon-reviews"),
]
