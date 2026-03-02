from rest_framework import serializers
from .models import User
from customers.models import Customer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
import uuid

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "first_name", "last_name"]

User = get_user_model()

class CustomerRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label="Confirm Password")

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match")
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email already registered")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')

        # Create User
        user = User.objects.create_user(
            username=validated_data['email'].split('@')[0] + "_" + str(uuid.uuid4())[:6],
            email=validated_data['email'],
            password=password,
            first_name=validated_data['first_name'],
            last_name=validated_data.get('last_name', ''),
            role='customer'
        )

        # Create Customer Profile (KYC Pending)
        Customer.objects.create(
            user=user,
            phone=validated_data['phone'],
            kyc_status="pending"
        )

        return user
