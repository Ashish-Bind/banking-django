from django.contrib import admin
from .models import Transaction, WithdrawalRequest, DepositRequest

# Register your models here.
admin.site.register(Transaction)
admin.site.register(DepositRequest)
admin.site.register(WithdrawalRequest)