"""ASGI config for ShamChess backend."""
from __future__ import annotations

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "shamchess_backend.settings")

django_asgi_app = get_asgi_application()

import shamchess_backend.routing  # noqa: E402  pylint: disable=wrong-import-position

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(shamchess_backend.routing.websocket_urlpatterns)
        ),
    }
)
