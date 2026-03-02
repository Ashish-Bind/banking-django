from django.urls import path
from . import views

urlpatterns = [
    path("create/", views.create_account),
    path('all/', views.all_accounts),
    path("", views.list_accounts),
]
