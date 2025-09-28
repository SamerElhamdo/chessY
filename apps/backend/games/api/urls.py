from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ChatMessageViewSet, GameViewSet, LobbyView, MatchmakingTicketView

router = DefaultRouter()
router.register(r"games", GameViewSet, basename="game")

chat_message_list = ChatMessageViewSet.as_view({"get": "list", "post": "create"})

urlpatterns = [
    path("", include(router.urls)),
    path("lobby/", LobbyView.as_view(), name="lobby"),
    path("matchmaking/ticket/", MatchmakingTicketView.as_view(), name="matchmaking-ticket"),
    path("games/<int:game_pk>/chat/", chat_message_list, name="game-chat"),
]
