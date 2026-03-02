# authentication/middleware.py  ← Create this file
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.state import token_backend
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

class JWTCookieChannelsMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        # Extract cookies from headers
        headers = dict(scope.get("headers", []))
        cookie_header = headers.get(b"cookie", b"").decode("utf-8", errors="ignore")

        access_token = None
        if "access=" in cookie_header:
            for cookie in cookie_header.split(";"):
                cookie = cookie.strip()
                if cookie.startswith("access="):
                    access_token = cookie.split("=", 1)[1]
                    break

        if access_token:
            scope["user"] = await self.get_user_from_token(access_token)
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            # Validate token
            UntypedToken(token)  # This just checks signature/expiry
            validated_token = token_backend.decode(token, verify=True)
            user_id = validated_token.get("user_id")
            return User.objects.get(id=user_id)
        except Exception:
            return AnonymousUser()