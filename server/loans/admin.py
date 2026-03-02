from django.contrib import admin
from .models import Loan, EMISchedule

# Register your models here.

admin.site.register(Loan)
admin.site.register(EMISchedule)