from rest_framework import serializers
from accounts.models import Account
from .models import Transaction, DepositRequest, WithdrawalRequest

class TransactionSerializer(serializers.ModelSerializer):
    account_number = serializers.CharField(source='account.account_number', read_only=True)
    account_type = serializers.CharField(source='account.account_type', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id',
            'transaction_type',  # DEPOSIT, WITHDRAW, TRANSFER
            'amount',
            'balance_after',
            'description',
            'created_at',
            'account_number',
            'account_type',
            'from_account',  # If you have these fields
            'to_account',
        ]
        read_only_fields = fields

class DepositSerializer(serializers.Serializer):
    account_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate(self, data):
        try:
            account = Account.objects.get(id=data["account_id"])
        except Account.DoesNotExist:
            raise serializers.ValidationError("Account not found")

        if data["amount"] <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")

        data["account"] = account
        return data

class WithdrawSerializer(serializers.Serializer):
    account_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate(self, data):
        try:
            account = Account.objects.get(id=data["account_id"])
        except Account.DoesNotExist:
            raise serializers.ValidationError("Account not found")

        if data["amount"] <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")

        if account.balance < data["amount"]:
            raise serializers.ValidationError("Insufficient balance")

        data["account"] = account
        return data

# serializers.py
class TransferSerializer(serializers.Serializer):
    from_account = serializers.IntegerField()  # Your account ID
    to_account_number = serializers.CharField(max_length=20)  # Recipient's account number
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    remark = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def validate(self, data):
        user = self.context['request'].user

        # 1. Validate sender account (must belong to user)
        try:
            from_acc = Account.objects.get(
                id=data["from_account"],
                customer__user=user  # Security: only your accounts
            )
        except Account.DoesNotExist:
            raise serializers.ValidationError("Invalid sender account")

        # 2. Find recipient by account number
        try:
            to_acc = Account.objects.get(account_number=data["to_account_number"])
        except Account.DoesNotExist:
            raise serializers.ValidationError("Recipient account not found")
        except Account.MultipleObjectsReturned:
            raise serializers.ValidationError("Invalid recipient account")

        # 3. Basic checks
        if from_acc == to_acc:
            raise serializers.ValidationError("Cannot transfer to your own account")

        if from_acc.balance < data["amount"]:
            raise serializers.ValidationError("Insufficient balance")

        if from_acc.status != "active" or to_acc.status != "active":
            raise serializers.ValidationError("One or both accounts are not active")

        if data["amount"] <= 0:
            raise serializers.ValidationError("Amount must be positive")

        # Attach objects for view
        data["from_acc"] = from_acc
        data["to_acc"] = to_acc
        return data

class DepositRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepositRequest
        fields = ["id", "account", "amount", "status", "created_at"]
        read_only_fields = ["status"]

class WithdrawalRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = WithdrawalRequest
        fields = ["id", "account", "amount", "status", "created_at"]
        read_only_fields = ["status"]