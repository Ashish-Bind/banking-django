from django.db import models
from accounts.models import Account
from django.db import models
from django.contrib.auth import get_user_model
from customers.models import Customer

# Create your models here.

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ("DEPOSIT", "Deposit"),
        ("WITHDRAW", "Withdraw"),
        ("TRANSFER", "Transfer"),
    ]

    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    # Only for transfer
    from_account = models.ForeignKey(Account, null=True, blank=True, on_delete=models.SET_NULL, related_name="outgoing_transfers")
    to_account = models.ForeignKey(Account, null=True, blank=True, on_delete=models.SET_NULL, related_name="incoming_transfers")

    balance_after = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} {self.amount} for Account {self.account.id}"
    

User = get_user_model()

class DepositRequest(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected")
    ]

    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"Deposit {self.amount} to {self.account.id} ({self.status})"
    
class WithdrawalRequest(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected")
    ]

    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"Withdraw {self.amount} from {self.account.id} ({self.status})"
    
class Beneficiary(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=20, unique=True)
    bank_name = models.CharField(max_length=100, default="Finzap Bank")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):  
        return f"{self.name} - {self.account_number}"