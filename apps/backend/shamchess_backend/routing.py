from django.urls import path

from games.routing import websocket_urlpatterns as game_websocket_urlpatterns

websocket_urlpatterns = [
    *game_websocket_urlpatterns,
]
