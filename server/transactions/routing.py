from django.urls import path
from .consumers import EmployeeNotificationConsumer

websocket_urlpatterns = [
    path("ws/notifications/employees/", EmployeeNotificationConsumer.as_asgi()),
]