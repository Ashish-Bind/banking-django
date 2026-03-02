from django.db import models
from authentication.models import User

# Create your models here.

class Customer(models.Model):
    KYC_STATUS = (
        ("pending", "Pending"),
        ("submitted", "Documents Submitted"),
        ("verified", "Verified"),
        ("rejected", "Rejected"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')

    phone = models.CharField(max_length=15)
    address = models.TextField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    aadhaar_number = models.CharField(max_length=12, unique=True, null=True, blank=True)
    pan_number = models.CharField(max_length=10, unique=True, null=True, blank=True)

    aadhaar_doc = models.FileField(upload_to='kyc/aadhaar/', null=True, blank=True)
    pan_doc = models.FileField(upload_to='kyc/pan/', null=True, blank=True)

    # KYC Fields
    kyc_status = models.CharField(max_length=20, choices=KYC_STATUS, default="pending")
    kyc_submitted_at = models.DateTimeField(null=True, blank=True)
    kyc_verified_at = models.DateTimeField(null=True, blank=True)
    kyc_verified_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="verified_customers")

    monthly_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    employment_type = models.CharField(
        max_length=20,
        choices=[("SALARIED", "Salaried"), ("SELF_EMPLOYED", "Self Employed"), ("BUSINESS", "Business")],
        default="SALARIED"
    )
    company_name = models.CharField(max_length=100, blank=True, null=True)

    # Auto-calculated by Gemini / your logic
    credit_score = models.IntegerField(default=300, help_text="300–900")  # Will be set by AI
    max_eligible_loan = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user.username} - {self.pk}'

'''

{
  "user": 3,
  "phone": "9876543210",
  "address": "Mumbai, India",
  "date_of_birth":"01-04-2004",
  "adhaar_number":"392865731285",
  "pan_number":"ABHI786GO"
}

'''