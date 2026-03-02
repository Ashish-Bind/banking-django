from django.urls import path
from . import views

urlpatterns = [
    path("", views.list_customers),
    path("create/", views.create_customer),
    path('overview/', views.customers_overview),
    path('kyc/pending/', views.pending_kyc_requests),
    path('kyc/<int:id>/approve/', views.approve_kyc),
    path('kyc/<int:id>/reject/', views.reject_kyc),
    path("<int:id>/", views.get_customer),
    path('accounts/', views.get_customer_accounts, name='customer_accounts'),
    path('apply-account/', views.apply_account, name='apply_account'),
    path('dashboard/', views.customer_dashboard, name='customer_dashboard'),
    path('employee/dashboard/', views.employee_dashboard, name='employee_dashboard'),
    path('profile/', views.customer_profile_view, name='profile'),
    path('kyc/upload/', views.upload_kyc_documents, name='upload-kyc'),
    path('accounts/all/', views.get_all_accounts),
    path('accounts/pending/', views.pending_account_requests),
    path('accounts/<int:id>/approve/', views.approve_account),
    path('accounts/<int:id>/reject/', views.reject_account),
]
