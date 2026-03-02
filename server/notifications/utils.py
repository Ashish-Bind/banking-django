# notifications/utils.py

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification
from django.utils import timezone
from accounts.models import Account  # or wherever your User model is
from django.contrib.auth import get_user_model

User = get_user_model()

def send_notification(
    user=None,
    title="",
    message="",
    notification_type="GENERAL",
    related_url=None,
    group=None,
):
    channel_layer = get_channel_layer()
    
    payload = {
        "title": title,
        "message": message,
        "type": notification_type,
        "created_at": timezone.now().isoformat(),
        "related_url": related_url,
    }

    if group:
        # Handle group notification (e.g., "employees")
        if group == "employees":
            # Get all employee/admin users
            employees = User.objects.filter(role__in=["employee", "admin"])
            
            notifications_created = []
            for emp in employees:
                # Save individual notification for each employee
                notif = Notification.objects.create(
                    user=emp,
                    title=title,
                    message=message,
                    notification_type=notification_type,
                    related_url=related_url,
                )
                notifications_created.append(notif)

            # Enhance payload for frontend (optional: include ID for marking read later)
            payload.update({
                "id": None,  # group notifications don't have single ID
                "is_read": False,
                "is_group_notification": True,
            })

            # Send via WebSocket to group
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    "employees",
                    {
                        "type": "notification.message",
                        "notification": payload,
                    }
                )

            return notifications_created  # optional: return created objects

    # Existing individual user flow (unchanged)
    if not user:
        return

    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        related_url=related_url,
    )

    payload.update({
        "id": notification.id,
        "is_read": False,
    })

    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            f"notifications_{user.id}",
            {
                "type": "notification.message",
                "notification": payload,
            }
        )

    return notification