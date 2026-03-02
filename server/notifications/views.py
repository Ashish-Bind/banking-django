from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from authentication.permissions import IsAdmin, IsEmployee
from rest_framework.response import Response
from authentication.auth import JWTCookieAuthentication
from .models import Notification
from .serializers import NotificationSerializer
from customers.models import Customer
# Create your views here.

# notifications/views.py
@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTCookieAuthentication])
def get_notifications(request):
    notifications = request.user.notifications.all()[:50]
    serializer = NotificationSerializer(notifications, many=True)
    unread_count = request.user.notifications.filter(is_read=False).count()
    return Response({
        "notifications": serializer.data,
        "unread_count": unread_count
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTCookieAuthentication])
def mark_notification_read(request, notification_id):
    try:
        notif = request.user.notifications.get(id=notification_id)
        notif.is_read = True
        notif.save()
        return Response({"status": "read"})
    except Notification.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTCookieAuthentication])
def mark_all_read(request):
    request.user.notifications.filter(is_read=False).update(is_read=True)
    return Response({"status": "all_read"})