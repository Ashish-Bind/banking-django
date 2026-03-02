# notifications/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        # Personal notification group
        self.group_name = f"notifications_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        # Add to "employees" group if role is employee or admin
        is_employee = await self.is_employee()
        if is_employee:
            await self.channel_layer.group_add("employees", self.channel_name)

        await self.accept()

        # Send initial unread count
        count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            "type": "unread_count",
            "count": count
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        if await self.is_employee():
            await self.channel_layer.group_discard("employees", self.channel_name)

    async def notification_message(self, event):
        await self.send(text_data=json.dumps(event["notification"]))

    @database_sync_to_async
    def get_unread_count(self):
        from .models import Notification
        return Notification.objects.filter(user=self.user, is_read=False).count()

    @database_sync_to_async
    def is_employee(self):
        return self.user.role in ["employee", "admin"]  # ← This is the fix!