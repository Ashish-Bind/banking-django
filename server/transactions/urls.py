from django.urls import path
from . import views

urlpatterns = [
    path('customer/', views.get_all_transactions, name='get_all_transactions'),
    path('beneficiaries/', views.list_beneficiaries, name='get_all_beneficiaries'),
    path('beneficiaries/add/', views.add_beneficiary, name='add_beneficiary'),

    path('recent-transfers/', views.recent_transfers, name="recent_transfers"),
    
    path("deposit/", views.deposit),
    path("withdraw/", views.withdraw),
    path("transfer/", views.transfer),

    # --- CUSTOMER REQUEST ENDPOINTS ---
    path("requests/deposit/", views.request_deposit, name="request-deposit"),
    path("requests/withdraw/", views.request_withdrawal, name="request-withdrawal"),

    # --- EMPLOYEE/ADMIN APPROVAL ENDPOINTS ---
    path("pending-deposits/", views.PendingDepositListView.as_view()),
    path("pending-withdrawals/", views.PendingWithdrawalListView.as_view()),
    path("approved-requests/", views.ApprovedRequestsListView.as_view()),
    path("rejected-requests/", views.RejectedRequestsListView.as_view()),

    path("approve-deposit/<int:request_id>/", views.approve_deposit),
    path("reject-deposit/<int:request_id>/", views.reject_deposit),
    path("approve-withdrawal/<int:request_id>/", views.approve_withdrawal),
    path("reject-withdrawal/<int:request_id>/", views.reject_withdrawal),
]
