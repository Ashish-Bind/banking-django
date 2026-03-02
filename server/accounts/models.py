from django.db import models
from customers.models import Customer
from authentication.models import User
import uuid

class Account(models.Model):
    ACCOUNT_TYPES = (
        ("savings", "Savings Account"),
        ("current", "Current Account"),
    )

    STATUS_CHOICES = (
        ("pending", "Pending Approval"),
        ("active", "Active"),
        ("rejected", "Rejected"),
        ("closed", "Closed"),
        ("inactive", 'Inactive')
    )

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="accounts")
    account_number = models.CharField(max_length=20, unique=True)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    approved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.account_number} - {self.customer.user.username} - {self.id} - {self.balance}"
    
    def save(self, *args, **kwargs):
        if not self.account_number:
            self.account_number = str(uuid.uuid4().int)[:12]  # 12-digit account number
        super().save(*args, **kwargs)
    
