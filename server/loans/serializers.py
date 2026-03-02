# loans/serializers.py
from rest_framework import serializers
from .models import Loan, EMISchedule
from accounts.serializers import AccountSerializer
from decimal import Decimal, getcontext

class LoanApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = ['loan_type', 'amount', 'tenure_months', 'purpose']
        read_only_fields = ['loan_id', 'status', 'created_at']

    def validate(self, data):
        customer = self.context['request'].user.customer_profile

        if not getattr(customer, 'kyc_status', False):
            raise serializers.ValidationError("Please complete KYC first.")

        if data['amount'] > customer.max_eligible_loan:
            raise serializers.ValidationError(
                f"Requested amount exceeds your eligibility of ₹{customer.max_eligible_loan:,.0f}"
            )

        amount = Decimal(data['amount'])
        tenure = Decimal(data['tenure_months'])
        annual_rate = Decimal("0.10")  # 10% interest

        monthly_rate = annual_rate / Decimal("12")

        # EMI formula fully using Decimal
        numerator = amount * monthly_rate * (1 + monthly_rate) ** tenure
        denominator = ((1 + monthly_rate) ** tenure) - Decimal("1")

        rough_emi = numerator / denominator

        # Salary check
        max_allowable_emi = Decimal(customer.monthly_salary) * Decimal("0.45")

        if rough_emi > max_allowable_emi:
            raise serializers.ValidationError(
                f"Loan EMI ₹{rough_emi.quantize(Decimal('0.01'))} exceeds allowed limit "
                f"of 45% of salary (₹{max_allowable_emi.quantize(Decimal('0.01'))})."
            )

        return data


class LoanSerializer(serializers.ModelSerializer):
    account = AccountSerializer(read_only=True)  # This includes nested customer data
    principal_amount = serializers.DecimalField(source='amount', max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Loan
        fields = [
            'loan_id', 'loan_type', 'amount', 'principal_amount', 'tenure_months', 'purpose',
            'interest_rate', 'emi_amount', 'status', 'created_at', 'approved_at',
            'account'  # This now includes full account + customer + user data
        ]


class EMIScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = EMISchedule
        fields = '__all__'