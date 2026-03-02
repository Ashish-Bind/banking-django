from django.db import models
from accounts.models import Account
from django.utils import timezone

class Loan(models.Model):
    LOAN_TYPES = [
        ("PERSONAL", "Personal Loan"),
        ("CAR", "Car Loan"),
        ("EDUCATION", "Education Loan"),
        ("HOME", "Home Loan"),
    ]

    loan_id = models.CharField(max_length=20, unique=True, editable=False)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="loans")

    loan_type = models.CharField(max_length=20, choices=LOAN_TYPES, default="PERSONAL")
    amount = models.DecimalField(max_digits=12, decimal_places=2, db_column="principal_amount")  # matches old name
    tenure_months = models.PositiveIntegerField()
    purpose = models.CharField(max_length=200)

    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    emi_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    status = models.CharField(
        max_length=10,
        choices=[("PENDING", "Pending"), ("APPROVED", "Approved"), ("REJECTED", "Rejected"), ("CLOSED", "Closed")],
        default="PENDING"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.loan_id:
            today = timezone.now().strftime('%Y%m%d')
            last_loan = Loan.objects.filter(loan_id__startswith=f"LOAN{today}").count()
            seq = last_loan + 1
            self.loan_id = f"LOAN{today}{seq:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.loan_id} - ₹{self.amount} ({self.get_status_display()})"
    
class EMISchedule(models.Model):
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name="emi_schedule")
    month_number = models.PositiveIntegerField()
    due_date = models.DateField()
    principal_component = models.DecimalField(max_digits=10, decimal_places=2)
    interest_component = models.DecimalField(max_digits=10, decimal_places=2)
    total_emi = models.DecimalField(max_digits=10, decimal_places=2)

    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"EMI {self.month_number} for Loan {self.loan.loan_id}"

