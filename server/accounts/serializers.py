from rest_framework import serializers
from .models import Account
from customers.serializers import CustomerSerializer

class AccountSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = "__all__"
        extra_fields = ["customer", "customer_name", "customer_email"]

    def get_customer(self, obj):
        from customers.serializers import CustomerSerializer
        return CustomerSerializer(obj.customer).data

    def get_customer_name(self, obj):
        return f"{obj.customer.user.first_name} {obj.customer.user.last_name}"

    def get_customer_email(self, obj):
        return obj.customer.user.email