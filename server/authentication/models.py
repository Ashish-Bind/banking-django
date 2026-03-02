from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("employee", "Employee"),
        ("customer", "Customer"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    email = models.EmailField(unique=True, blank=False, null=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return self.email