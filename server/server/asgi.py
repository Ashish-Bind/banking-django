import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
import notifications.routing
from authentication.middleware import JWTCookieChannelsMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTCookieChannelsMiddleware(
        URLRouter(notifications.routing.websocket_urlpatterns)
    ),
})