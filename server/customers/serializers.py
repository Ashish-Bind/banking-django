from rest_framework import serializers
from .models import Customer
from authentication.models import User

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role"]

class CustomerSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id', 'user', 'phone', 'address', 'date_of_birth',
            'aadhaar_number', 'pan_number', 'kyc_status',
            'kyc_submitted_at', 'kyc_verified_at',
            'monthly_salary', 'employment_type', 'company_name',
            'credit_score', 'max_eligible_loan', 'updated_at',
            'aadhaar_doc', 'pan_doc'
        ]
        read_only_fields = ['kyc_verified_at', 'credit_score', 'max_eligible_loan']

class CustomerProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Customer
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'address', 
            'date_of_birth', 'kyc_status', 'aadhaar_number', 'pan_number',
            'monthly_salary', 'employment_type', 'company_name',
            'credit_score', 'max_eligible_loan'
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        # Update User fields
        instance.user.first_name = user_data.get('first_name', instance.user.first_name)
        instance.user.last_name = user_data.get('last_name', instance.user.last_name)
        instance.user.save()
        
        # Update Customer fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class KYCUploadSerializer(serializers.ModelSerializer):
    aadhaar_doc = serializers.FileField(required=True)
    pan_doc = serializers.FileField(required=True)

    class Meta:
        model = Customer
        fields = ['aadhaar_doc', 'pan_doc']

    def validate(self, data):
        # Optional: Check file types
        for field in ['aadhaar_doc', 'pan_doc']:
            file = data[field]
            if not file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.pdf')):
                raise serializers.ValidationError(f"{field} must be image or PDF")
        return data

    def save(self):
        customer = self.context['customer']
        customer.aadhaar_doc = self.validated_data['aadhaar_doc']
        customer.pan_doc = self.validated_data['pan_doc']
        customer.kyc_status = 'submitted'
        customer.save()