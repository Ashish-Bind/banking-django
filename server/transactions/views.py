from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction as db_transaction
from authentication.auth import JWTCookieAuthentication
from authentication.permissions import IsAdmin, IsEmployee, IsCustomer
from accounts.models import Account
from .serializers import TransactionSerializer, DepositSerializer, WithdrawSerializer, TransferSerializer, DepositRequestSerializer, WithdrawalRequestSerializer
from .models import Transaction, DepositRequest, WithdrawalRequest, Beneficiary
from django.utils import timezone
from customers.models import Customer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from notifications.utils import send_notification

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin | IsEmployee])
def deposit(request):
    serializer = DepositSerializer(data=request.data)
    
    if serializer.is_valid():
        account = serializer.validated_data["account"]
        amount = serializer.validated_data["amount"]

        if account.status != "active":
            return Response({"error": "Account is inactive"}, status=400)

        with db_transaction.atomic():
            # Update balance
            account.balance += amount
            account.save()

            # Create transaction record
            Transaction.objects.create(
                account=account,
                transaction_type="DEPOSIT",
                amount=amount,
                balance_after=account.balance,
                description="Deposit via API"
            )

        return Response({
            "message": "Deposit successful",
            "new_balance": account.balance
        }, status=200)

    return Response(serializer.errors, status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin | IsEmployee])
def withdraw(request):
    serializer = WithdrawSerializer(data=request.data)
    
    if serializer.is_valid():
        account = serializer.validated_data["account"]
        amount = serializer.validated_data["amount"]

        if account.balance < amount:
            return Response({"error": "Insufficient balance"}, status=400)

        if account.status != "active":
            return Response({"error": "Account is inactive"}, status=400)

        with db_transaction.atomic():
            account.balance -= amount
            account.save()

            Transaction.objects.create(
                account=account,
                transaction_type="WITHDRAW",
                amount=amount,
                balance_after=account.balance,
                description="Withdrawal via API"
            )

        return Response({
            "message": "Withdrawal successful",
            "new_balance": account.balance
        }, status=200)

    return Response(serializer.errors, status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin | IsEmployee | IsCustomer])
@authentication_classes([JWTCookieAuthentication])
def transfer(request):
    serializer = TransferSerializer(data=request.data, context={'request': request})

    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    from_acc = serializer.validated_data["from_acc"]
    to_acc = serializer.validated_data["to_acc"]
    amount = serializer.validated_data["amount"]
    remark = serializer.validated_data.get("remark", "Transfer")

    with db_transaction.atomic():
        # Deduct
        from_acc.balance -= amount
        from_acc.save()

        Transaction.objects.create(
            account=from_acc,
            transaction_type="TRANSFER_OUT",
            amount=amount,
            balance_after=from_acc.balance,
            description=f"To {to_acc.account_number[-4:]} • {remark}",
            to_account=to_acc,
        )

        # Credit
        to_acc.balance += amount
        to_acc.save()

        Transaction.objects.create(
            account=to_acc,
            transaction_type="TRANSFER_IN",
            amount=amount,
            balance_after=to_acc.balance,
            description=f"From {from_acc.account_number[-4:]} • {remark}",
            from_account=from_acc,
        )

    return Response({
        "message": "Transfer successful!",
        "new_balance": from_acc.balance,
        "recipient_last4": to_acc.account_number[-4:]
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsCustomer])
@authentication_classes([JWTCookieAuthentication])
def request_deposit(request):
    serializer = DepositRequestSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(customer=request.user)
        send_notification(
        title="New Deposit Request",
        message=f"Customer requested deposit",
        notification_type="DEPOSIT_REQUEST",
        related_url=f"/employee/deposits/pending/",
        group="employees"   # ← This sends to all employees
        )
        return Response({"message": "Deposit request submitted"}, status=201)

    return Response(serializer.errors, status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsCustomer])
@authentication_classes([JWTCookieAuthentication])
def request_withdrawal(request):
    serializer = WithdrawalRequestSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(customer=request.user)
        return Response({"message": "Withdrawal request submitted"}, status=201)

    return Response(serializer.errors, status=400)


class PendingDepositListView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee | IsAdmin]
    authentication_classes = [JWTCookieAuthentication]

    def get(self, request):
        requests = DepositRequest.objects.filter(status="PENDING").select_related("account", "customer")
        serializer = DepositRequestSerializer(requests, many=True)
        return Response(serializer.data)


class PendingWithdrawalListView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated, IsEmployee | IsAdmin]

    def get(self, request):
        requests = WithdrawalRequest.objects.filter(status="PENDING").select_related("account", "customer")
        serializer = WithdrawalRequestSerializer(requests, many=True)
        return Response(serializer.data)


class ApprovedRequestsListView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated, IsEmployee | IsAdmin]

    def get(self, request):
        deposits = DepositRequest.objects.filter(status="APPROVED").select_related("account", "customer")
        withdrawals = WithdrawalRequest.objects.filter(status="APPROVED").select_related("account", "customer")

        dep_serializer = DepositRequestSerializer(deposits, many=True)
        with_serializer = WithdrawalRequestSerializer(withdrawals, many=True)

        data = {
            "deposits": dep_serializer.data,
            "withdrawals": with_serializer.data,
        }
        return Response(data)


class RejectedRequestsListView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated, IsEmployee | IsAdmin]

    def get(self, request):
        deposits = DepositRequest.objects.filter(status="REJECTED").select_related("account", "customer")
        withdrawals = WithdrawalRequest.objects.filter(status="REJECTED").select_related("account", "customer")

        dep_serializer = DepositRequestSerializer(deposits, many=True)
        with_serializer = WithdrawalRequestSerializer(withdrawals, many=True)

        data = {
            "deposits": dep_serializer.data,
            "withdrawals": with_serializer.data,
        }
        return Response(data)

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsEmployee | IsAdmin])
@authentication_classes([JWTCookieAuthentication])
def approve_deposit(request, request_id):
    try:
        req = DepositRequest.objects.get(id=request_id, status="PENDING")
    except DepositRequest.DoesNotExist:
        return Response({"error": "Request not found or already processed"}, status=404)

    with db_transaction.atomic():
        acc = req.account
        acc.balance += req.amount
        acc.save()

        Transaction.objects.create(
            account=acc,
            transaction_type="DEPOSIT",
            amount=req.amount,
            balance_after=acc.balance,
            description=f"Deposit approved by {request.user.username}",
        )

        req.status = "APPROVED"
        req.reviewed_at = timezone.now()
        req.reviewed_by = request.user
        req.save()

        send_notification(
        user=req.account.customer.user,
        title="Deposit Request Approved!",
        message=f"₹{req.amount} has been credited to your account ",
        notification_type="ACCOUNT_CREDITED",
        related_url="/customer/accounts"
        )


        send_notification(
            title="Deposit Approved",
            message=f"{request.user.username} approved ₹{req.amount} deposit for {req.account.customer.user.username}",
            notification_type="ACTION_LOG",
            related_url=f"/employee/deposits/approved/",  # or a log page
            group="employees"
        )
    return Response({"message": "Deposit approved successfully"})

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsEmployee | IsAdmin])
@authentication_classes([JWTCookieAuthentication])
def reject_deposit(request, request_id):
    try:
        req = DepositRequest.objects.get(id=request_id, status="PENDING")
    except DepositRequest.DoesNotExist:
        return Response({"error": "Request not found or already processed"}, status=404)

    req.status = "REJECTED"
    req.reviewed_at = timezone.now()
    req.reviewed_by = request.user
    req.save()

    send_notification(
    user=req.account.customer.user,
    title="Deposit Request rejected!",
    message=f"₹{req.amount} has not been credited to your account ",
    notification_type="ACCOUNT_WITHDRAWAL",
    related_url="/customer/accounts"
    )

    send_notification(
        title="Deposit rejected",
        message=f"{request.user.username} rejected ₹{req.amount} deposit for {req.account.customer.user.username}",
        notification_type="ACTION_LOG",
        related_url=f"/employee/deposit/rejected/",  # or a log page
        group="employees"
    )

    return Response({"message": "Deposit request rejected"})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsEmployee | IsAdmin])
@authentication_classes([JWTCookieAuthentication])
def approve_withdrawal(request, request_id):
    try:
        req = WithdrawalRequest.objects.get(id=request_id, status="PENDING")
    except WithdrawalRequest.DoesNotExist:
        return Response({"error": "Request not found or already processed"}, status=404)

    with db_transaction.atomic():
        acc = req.account
        if acc.balance < req.amount:
            return Response({"error": "Insufficient balance"}, status=400)

        acc.balance -= req.amount
        acc.save()

        Transaction.objects.create(
            account=acc,
            transaction_type="WITHDRAW",
            amount=req.amount,
            balance_after=acc.balance,
            description=f"Withdrawal approved by {request.user.username}",
        )

        req.status = "APPROVED"
        req.reviewed_at = timezone.now()
        req.reviewed_by = request.user
        req.save()

        send_notification(
        user=req.account.customer.user,
        title="Withdrawal Request Approved!",
        message=f"₹{req.amount} has been credited to your account ",
        notification_type="ACCOUNT_DEBITED",
        related_url="/customer/accounts"
        )

        send_notification(
            title="Withdrawal Approved",
            message=f"{request.user.username} approved ₹{req.amount} withdrawal for {req.account.customer.user.username}",
            notification_type="ACTION_LOG",
            related_url=f"/employee/withdraw/approved/",  # or a log page
            group="employees"
        )

    return Response({"message": "Withdrawal approved successfully"})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsEmployee | IsAdmin])
@authentication_classes([JWTCookieAuthentication])
def reject_withdrawal(request, request_id):
    try:
        req = WithdrawalRequest.objects.get(id=request_id, status="PENDING")
    except WithdrawalRequest.DoesNotExist:
        return Response({"error": "Request not found or already processed"}, status=404)

    req.status = "REJECTED"
    req.reviewed_at = timezone.now()
    req.reviewed_by = request.user
    req.save()

    send_notification(
    user=req.account.customer.user,
    title="Withdrawal Request rejected!",
    message=f"₹{req.amount} has not been debited to your account ",
    notification_type="ACCOUNT_WITHDRAWAL",
    related_url="/customer/accounts"
    )

    send_notification(
        title="Withdrawal rejected",
        message=f"{request.user.username} rejected ₹{req.amount} withdrawal for {req.account.customer.user.username}",
        notification_type="ACTION_LOG",
        related_url=f"/employee/withdraw/rejected/",  # or a log page
        group="employees"
    )

    return Response({"message": "Withdrawal request rejected"})

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsCustomer])
@authentication_classes([JWTCookieAuthentication])
def add_beneficiary(request):
    name = request.data.get("name")
    account_number = request.data.get("account_number")

    if not name or not account_number:
        return Response({"error": "Name and account number required"}, status=400)

    # Optional: Verify account exists
    try:
        account = Account.objects.get(account_number=account_number)


    except Account.DoesNotExist:
        return Response({"error": "Account does not exist"}, status=400)

    customer = customer = Customer.objects.get(user=request.user)

    if account.customer == customer:
        return Response({"error":"Self Account cannot be added"}, status=400)

    beneficiary, created = Beneficiary.objects.get_or_create(
        customer=customer,
        account_number=account_number,
        defaults={"name": name}
    )

    if not created:
        return Response({"message": "Beneficiary already exists"}, status=200)

    return Response({"message": "Beneficiary added successfully"})

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsCustomer])
@authentication_classes([JWTCookieAuthentication])
def list_beneficiaries(request):
    customer = Customer.objects.get(user=request.user) 
    beneficiaries = Beneficiary.objects.filter(customer=customer)
    data = [
        {
            "id": b.id,
            "name": b.name,
            "account_number": b.account_number,
            "nickname": b.name,
        }
        for b in beneficiaries
    ]
    return Response({"beneficiaries": data})

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsCustomer])
@authentication_classes([JWTCookieAuthentication])
def recent_transfers(request):
    try:
        # Get the customer linked to the logged-in user
        customer = Customer.objects.get(user=request.user)  # Assuming OneToOneField: User.customer
    except AttributeError:
        return Response({"error": "Customer profile not found"}, status=404)

    # Get all accounts for this customer
    accounts = Account.objects.filter(customer=customer)

    # Get all transactions for these accounts
    transactions = Transaction.objects.filter(account__in=accounts, transaction_type="TRANSFER_OUT").order_by('-created_at')

    # Serialize the data
    serializer = TransactionSerializer(transactions, many=True)

    return Response({
        "recent_transfers": serializer.data,
        "total": transactions.count(),
        "message": "Transactions retrieved successfully"
    }, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCustomer])
@authentication_classes([JWTCookieAuthentication])
def get_all_transactions(request):
    try:
        # Get the customer linked to the logged-in user
        customer = Customer.objects.get(user=request.user)  # Assuming OneToOneField: User.customer
    except AttributeError:
        return Response({"error": "Customer profile not found"}, status=404)

    # Get all accounts for this customer
    accounts = Account.objects.filter(customer=customer)

    # Get all transactions for these accounts
    transactions = Transaction.objects.filter(account__in=accounts).order_by('-created_at')

    # Serialize the data
    serializer = TransactionSerializer(transactions, many=True)
    
    return Response({
        "transactions": serializer.data,
        "total": transactions.count(),
        "message": "Transactions retrieved successfully"
    }, status=200)