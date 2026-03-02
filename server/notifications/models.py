from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("LOAN_APPLIED", "Loan Application Submitted"),
        ("LOAN_APPROVED", "Loan Approved"),
        ("LOAN_REJECTED", "Loan Rejected"),
        ("DEPOSIT_REQUEST", "Deposit Request Received"),
        ("EMI_PAID", "EMI Paid Successfully"),
        ("EMI_OVERDUE", "EMI Overdue"),
        ("ACCOUNT_CREDITED", "Account Credited"),
        ("GENERAL", "General Announcement"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    related_url = models.URLField(blank=True, null=True)  # e.g., /loans/LN000123

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.user.get_full_name() or self.user.username}"