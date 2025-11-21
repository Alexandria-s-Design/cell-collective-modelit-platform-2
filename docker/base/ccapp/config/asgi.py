"""
ASGI config for ccapp project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from v1.users.middleware.jwt_auth_middleware import JWTAuthMiddleware
import v1.users.websocket_urls

# django asgi app for http handling
django_asgi_app = get_asgi_application()
# final asgi application with support for websockets
application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": JWTAuthMiddleware(
            # AuthMiddlewareStack(
                URLRouter(v1.users.websocket_urls.websocket_urlpatterns)
            # )
        ),
    }
)
