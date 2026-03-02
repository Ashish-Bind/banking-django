from django.urls import path
from . import views

urlpatterns = [
    # Loan Application
    path("apply/", views.apply_loan, name="apply-loan"),
    path('pending/', views.pending_loans),
    path('approved/', views.approved_loans, name='approved-loans'),
    path('eligibility/', views.get_loan_eligibility),

    # Loan Approval (Admin/Employee Only)
    path("approve/<str:loan_id>/", views.approve_loan, name="approve-loan"),

    # EMI Schedule
    path("<str:loan_id>/schedule/", views.get_emi_schedule, name="loan-emi-schedule"),

    # Customer Loans    
    path("my/", views.my_loans, name="my-loans"),
    path("<str:loan_id>/", views.loan_detail, name="loan-detail"),

    # EMI Payment
    path("<str:loan_id>/pay-emi/", views.pay_emi, name="pay-emi"),

    # Employee Endpoints
    path('application/<str:loan_id>/', views.loan_application_detail),
    path('process/<str:loan_id>/', views.process_loan_application),
]
