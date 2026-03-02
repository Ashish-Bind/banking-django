from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from authentication.permissions import IsAdmin, IsEmployee
from rest_framework.response import Response
from authentication.auth import JWTCookieAuthentication
from .models import Account
from .serializers import AccountSerializer
from customers.models import Customer

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin | IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def create_account(request):
    customer_id = request.data.get("customer_id")
    account_type = request.data.get("account_type")
    opening_balance = request.data.get("opening_balance", 0)

    try:
        customer = Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=404)

    account = Account.objects.create(
        customer=customer,
        account_type=account_type,
        balance=opening_balance
    )

    serializer = AccountSerializer(account)
    return Response(serializer.data, status=201)

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin | IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def list_accounts(request):
    accounts = Account.objects.all()
    serializer = AccountSerializer(accounts, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin | IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def all_accounts(request):
    """List all bank accounts"""
    accounts = Account.objects.select_related('customer__user').all()
    serializer = AccountSerializer(accounts, many=True)
    return Response(serializer.data)