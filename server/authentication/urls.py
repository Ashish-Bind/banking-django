from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.CustomerRegisterView.as_view()),
    path("login/", views.LoginView.as_view()),
    path("logout/", views.LogoutView.as_view()),
    path("user/", views.GetCurrentUserView.as_view()),
    path("admin-only/", views.admin_only),
    path("employee-only/", views.employee_only),
    path("customer-only/", views.customer_only),
]

