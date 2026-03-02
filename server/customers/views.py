from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from accounts.models import Account
from accounts.serializers import AccountSerializer
from authentication.permissions import IsAdmin, IsEmployee, IsCustomer
from .models import Customer
from .serializers import CustomerSerializer, CustomerProfileSerializer,KYCUploadSerializer
from authentication.auth import JWTCookieAuthentication
from django.db.models import Sum
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Q, F
from datetime import datetime, timedelta
from transactions.models import Transaction
from loans.models import Loan, EMISchedule
from accounts.models import Account
from transactions.models import Transaction, DepositRequest, WithdrawalRequest
from notifications.models import Notification
from django.db.models import Sum, Q
from datetime import date

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin | IsEmployee])
def create_customer(request):
    serializer = CustomerSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def reject_kyc(request, id):
    try:
        customer = Customer.objects.get(id=id)
        reason = request.data.get("reason", "No reason provided")
        customer.kyc_status = "rejected"
        customer.kyc_rejected_reason = reason
        customer.save()
        return Response({"message": "KYC Rejected", "reason": reason})
    except Customer.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def approve_kyc(request, id):
    try:
        customer = Customer.objects.get(id=id)
        customer.kyc_status = "verified"
        customer.kyc_verified_by = request.user
        customer.kyc_verified_at = timezone.now()
        customer.save()
        return Response({"message": "KYC Approved"})
    except Customer.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def reject_kyc(request, id):
    try:
        customer = Customer.objects.get(id=id)
        reason = request.data.get("reason", "No reason provided")
        customer.kyc_status = "rejected"
        customer.kyc_rejected_reason = reason
        customer.save()
        return Response({"message": "KYC Rejected", "reason": reason})
    except Customer.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
    
# 1. Get all accounts for logged-in customer
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCustomer])
@authentication_classes([JWTCookieAuthentication])
def get_customer_accounts(request):
    customer = request.user.customer_profile
    accounts = Account.objects.filter(customer=customer).order_by('-created_at')
    
    return Response({
        "accounts": AccountSerializer(accounts, many=True).data,
        "total_balance": sum(float(acc.balance) for acc in accounts if acc.status == "active"),
        "pending_requests": accounts.filter(status="pending").count()
    })


# 2. Apply for account (you already have this — just make sure URL matches)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
@authentication_classes([JWTCookieAuthentication])
def apply_account(request):
    if not hasattr(request.user, 'customer_profile') or request.user.customer_profile.kyc_status != "verified":
        return Response({"error": "Complete KYC first"}, status=400)

    # Prevent duplicate pending requests
    existing_pending = Account.objects.filter(
        customer=request.user.customer_profile,
        status="pending"
    ).exists()
    
    if existing_pending:
        return Response({"error": "You already have a pending account request"}, status=400)

    account = Account.objects.create(
        customer=request.user.customer_profile,
        account_type=request.data.get("account_type", "savings"),
        status="pending"
    )
    
    return Response({
        "message": "Account request submitted successfully!",
        "account_number": account.account_number,
        "account_type": account.get_account_type_display(),
        "status": "pending"
    }, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def pending_kyc_requests(request):
    customers = Customer.objects.filter(kyc_status="submitted").select_related('user')
    data = []
    for c in customers:
        data.append({
            "id": c.id,
            "full_name": c.user.get_full_name() or c.user.username,
            "email": c.user.email,
            "phone": c.phone or "",
            "aadhaar_number": c.aadhaar_number or "Not provided",
            "pan_number": c.pan_number or "Not provided",
            "aadhaar_doc": c.aadhaar_doc.url if c.aadhaar_doc else None,
            "pan_doc": c.pan_doc.url if c.pan_doc else None,
            "kyc_submitted_at": c.kyc_submitted_at,
        })
    return Response(data)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated, IsCustomer])
@authentication_classes([JWTCookieAuthentication])
def customer_profile_view(request):
    customer = get_object_or_404(Customer, user=request.user)
    
    if request.method == 'GET':
        serializer = CustomerProfileSerializer(customer)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = CustomerProfileSerializer(customer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
@authentication_classes([JWTCookieAuthentication])
def upload_kyc_documents(request):
    customer = get_object_or_404(Customer, user=request.user)
    
    # Prevent re-upload if already verified
    if customer.kyc_status in ['verified', 'submitted']:
        return Response({"error": "KYC already submitted or verified"}, status=400)
    
    serializer = KYCUploadSerializer(data=request.data, context={'customer': customer})
    if serializer.is_valid():
        serializer.save()
        return Response({
            "message": "KYC documents uploaded successfully. Under review.",
            "kyc_status": "submitted"
        }, status=200)
    
    return Response(serializer.errors, status=400)

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin | IsEmployee])
def list_customers(request):
    customers = Customer.objects.all()
    serializer = CustomerSerializer(customers, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_customer(request, id):
    try:
        customer = Customer.objects.get(id=id)
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=404)

    serializer = CustomerSerializer(customer)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsCustomer])
@authentication_classes([JWTCookieAuthentication])
def customer_dashboard(request):
    try:
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        return Response({"error": "Customer profile not found"}, status=404)

    # All customer accounts
    accounts = Account.objects.filter(customer=customer)
    total_balance = sum(acc.balance for acc in accounts)

    # 1. Active Loans count
    active_loans = Loan.objects.filter(account__customer=customer, status="APPROVED").count()

    # 2. Next EMI (earliest unpaid EMI)
    today = timezone.now().date()
    next_emi = EMISchedule.objects.filter(
        loan__account__customer=customer,
        is_paid=False,
        due_date__gte=today
    ).order_by('due_date').first()

    next_emi_data = None
    if next_emi:
        next_emi_data = {
            "amount": float(next_emi.total_emi),
            "due_date": next_emi.due_date.strftime("%d %b")
        }

    # 3. This month net income/expense
    month_start = today.replace(day=1)
    transactions_this_month = Transaction.objects.filter(
        account__customer=customer,
        timestamp__year=today.year,
        timestamp__month=today.month
    )

    # Simple way: Credits (DEPOSIT + incoming transfer) - Debits (WITHDRAW + outgoing transfer)
    total_credit = transactions_this_month.filter(
        Q(transaction_type="DEPOSIT") |
        Q(transaction_type="TRANSFER", to_account__customer=customer)
    ).aggregate(total=Sum('amount'))['total'] or 0

    total_debit = transactions_this_month.filter(
        Q(transaction_type="WITHDRAW") |
        Q(transaction_type="TRANSFER", from_account__customer=customer)
    ).aggregate(total=Sum('amount'))['total'] or 0

    this_month_net = total_credit - total_debit

    # 4. Last 5 transactions
    recent_transactions = Transaction.objects.filter(
        account__customer=customer
    ).order_by('-timestamp')[:5]

    transactions_list = []
    for t in recent_transactions:
        if t.transaction_type == "DEPOSIT":
            sign = "+"
            kind = "Credit"
            desc = t.description or "Deposit"
        elif t.transaction_type == "WITHDRAW":
            sign = "-"
            kind = "Debit"
            desc = t.description or "Withdrawal"
        else:  # TRANSFER
            if t.from_account and t.from_account.customer == customer:
                sign = "-"
                kind = "Transfer"
                desc = t.description or "Transfer Out"
            else:
                sign = "+"
                kind = "Transfer"
                desc = t.description or "Transfer In"

        transactions_list.append({
            "type": kind,
            "desc": desc,
            "amount": f"{sign}₹{t.amount}",
            "date": "Today" if t.timestamp.date() == today else t.timestamp.strftime("%b %d")
        })

    # Final response
    data = {
        "profile": CustomerSerializer(customer).data,
        "accounts": AccountSerializer(accounts, many=True).data,
        "total_balance": float(total_balance),
        "total_accounts": accounts.count(),
        "active_loans": active_loans,
        "next_emi": next_emi_data,
        "this_month_net": float(this_month_net),
        "recent_transactions": transactions_list,
    }

    return Response(data)
@api_view(['GET'])
@permission_classes([IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def get_all_accounts(request):
    """Get all accounts for employee dashboard"""
    accounts = Account.objects.select_related('customer__user').all().order_by('-created_at')
    data = []
    for acc in accounts:
        data.append({
            "id": acc.id,
            "account_number": acc.account_number,
            "account_type": acc.get_account_type_display(),
            "balance": float(acc.balance),
            "status": acc.status,
            "customer_name": acc.customer.user.get_full_name() or acc.customer.user.username,
            "customer_email": acc.customer.user.email,
            "created_at": acc.created_at,
        })
    return Response(data)

@api_view(['GET'])
@permission_classes([IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def pending_account_requests(request):
    """Get pending account requests"""
    accounts = Account.objects.filter(status="pending").select_related('customer__user')
    data = []
    for acc in accounts:
        customer = acc.customer
        data.append({
            "id": acc.id,
            "account_number": acc.account_number,
            "account_type": acc.get_account_type_display(),
            "customer_id": customer.id,
            "customer_name": customer.user.get_full_name() or customer.user.username,
            "customer_email": customer.user.email,
            "customer_phone": customer.phone or "",
            "kyc_status": customer.kyc_status,
            "created_at": acc.created_at,
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def approve_account(request, id):
    try:
        account = Account.objects.get(id=id, status="pending")
        account.status = "active"
        account.approved_by = request.user
        account.approved_at = timezone.now()
        account.save()
        return Response({"message": "Account approved successfully"})
    except Account.DoesNotExist:
        return Response({"error": "Account not found or not pending"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def reject_account(request, id):
    try:
        account = Account.objects.get(id=id, status="pending")
        reason = request.data.get("reason", "No reason provided")
        account.status = "rejected"
        account.rejected_reason = reason  # Add this field to Account model if needed
        account.save()
        return Response({"message": "Account rejected", "reason": reason})
    except Account.DoesNotExist:
        return Response({"error": "Account not found or not pending"}, status=status.HTTP_404_NOT_FOUND)

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin | IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def customers_overview(request):
    """Employee dashboard - overview of all customers"""
    customers = Customer.objects.select_related('user').all()
    total_customers = customers.count()
    active_customers = Account.objects.filter(status='active').count()
    total_balance = Account.objects.aggregate(total=Sum('balance'))['total'] or 0
    total_accounts = Account.objects.count()

    data = []
    for customer in customers:
        accounts = Account.objects.filter(customer=customer)
        cust_data = CustomerSerializer(customer).data
        cust_data.update({
            "full_name": f"{customer.user.first_name} {customer.user.last_name}",
            "email": customer.user.email,
            "total_balance": sum(acc.balance for acc in accounts),
            "account_count": accounts.count(),
            "joined_date": customer.user.date_joined.strftime("%b %d, %Y"),
        })
        data.append(cust_data)

    summary = {
        "total_customers": total_customers,
        "active_customers": active_customers,
        "total_accounts": total_accounts,
        "total_balance_in_bank": float(total_balance),
    }

    return Response({
        "summary": summary,
        "customers": data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsEmployee | IsAdmin])
@authentication_classes([JWTCookieAuthentication])
def employee_dashboard(request):
    today = timezone.now().date()

    # 1. Total Customers
    total_customers = Customer.objects.count()

    # 2. Today's Deposits & Withdrawals (from transactions)
    today_transactions = Transaction.objects.filter(
        timestamp__date=today
    )

    today_deposits = today_transactions.filter(
        transaction_type__in=["DEPOSIT", "TRANSFER_IN"]
    ).aggregate(total=Sum('amount'))['total'] or 0

    today_withdrawals = today_transactions.filter(
        transaction_type__in=["WITHDRAW", "TRANSFER_OUT"]
    ).aggregate(total=Sum('amount'))['total'] or 0

    # 3. Pending Actions
    pending_deposit_requests = DepositRequest.objects.filter(status="PENDING").count()
    pending_withdrawal_requests = WithdrawalRequest.objects.filter(status="PENDING").count()
    pending_loan_applications = Loan.objects.filter(status="PENDING").count()
    pending_account_requests = Account.objects.filter(status="pending").count()

    total_pending_actions = (
        pending_deposit_requests +
        pending_withdrawal_requests +
        pending_loan_applications +
        pending_account_requests
    )

    # 4. Recent Activity → Use Notifications (best real-time feed!)
    recent_notifications = Notification.objects.filter(
        user=request.user,
        created_at__date=today
    ).select_related('user').order_by('-created_at')[:10]

    recent_activity = []
    for notif in recent_notifications:
        # Customize icon/color logic based on type
        if "loan" in notif.title.lower() or notif.notification_type in ["LOAN_APPLICATION", "LOAN_APPROVED", "LOAN_REJECTED"]:
            icon = "HandCoins"
            color = "purple"
        elif "deposit" in notif.message.lower() or "credited" in notif.message.lower():
            icon = "ArrowDownRight"
            color = "green"
        elif "withdraw" in notif.message.lower() or "debit" in notif.message.lower():
            icon = "ArrowUpRight"
            color = "red"
        else:
            icon = "DollarSign"
            color = "blue"

        recent_activity.append({
            "id": notif.id,
            "title": notif.title,
            "message": notif.message.split('\n')[0],  # first line only
            "amount": extract_amount(notif.message),  # helper below
            "time": time_ago(notif.created_at),
            "type": notif.notification_type,
            "icon": icon,
            "color": color,
            "related_url": notif.related_url,
        })

    # If no notifications today, fallback to recent transactions (optional)
    if not recent_activity:
        recent_txns = Transaction.objects.select_related('account__customer__user').order_by('-timestamp')[:5]
        for txn in recent_txns:
            customer_name = txn.account.customer.user.get_full_name() or txn.account.customer.user.username
            action = {
                "DEPOSIT": "Deposited Cash",
                "WITHDRAW": "Requested Cash Withdrawal",
                "TRANSFER_OUT": "Transferred Money",
                "TRANSFER_IN": "Received Transfer",
            }.get(txn.transaction_type, txn.transaction_type.replace("_", " ").title())

            recent_activity.append({
                "title": f"{customer_name}",
                "message": action,
                "amount": f"₹{txn.amount:,.0f}",
                "time": "Just now" if txn.timestamp.date() == today else time_ago(txn.timestamp),
                "icon": "ArrowDownRight" if txn.transaction_type in ["DEPOSIT", "TRANSFER_IN"] else "ArrowUpRight",
                "color": "green" if txn.transaction_type in ["DEPOSIT", "TRANSFER_IN"] else "red",
            })

    # Final Response
    data = {
        "stats": {
            "total_customers": total_customers,
            "today_deposits": int(today_deposits),
            "today_withdrawals": int(today_withdrawals),
            "pending_cash_requests": pending_deposit_requests + pending_withdrawal_requests,
            "pending_loans": pending_loan_applications,
            "pending_account_requests": pending_account_requests,
            "total_pending_actions": total_pending_actions,
        },
        "recent_activity": recent_activity[:8],  # limit to 8
    }

    return Response(data)


# Helper: extract amount from message like "₹50,000 has been credited"
import re
def extract_amount(text):
    match = re.search(r'₹\s*([\d,]+)', text.replace(',', ''))
    if match:
        return f"₹{int(match.group(1)):,}"
    return None


# Helper: human readable time
from django.utils.timesince import timesince
def time_ago(dt):
    return timesince(dt).split(',')[0] + " ago" if timesince(dt) != "0 minutes" else "Just now"