from __future__ import annotations

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone

from ..models import Game, MatchmakingTicket


def broadcast_lobby_state() -> None:
    layer = get_channel_layer()
    if layer is None:
        return
    now = timezone.now()
    recent = list(
        Game.objects.select_related("white_player", "black_player").order_by("-created_at")[:5]
    )
    payload = {
        "type": "lobby_state",
        "active_games": Game.objects.filter(status=Game.Status.LIVE).count(),
        "waiting_games": Game.objects.filter(status=Game.Status.WAITING).count(),
        "queue_count": MatchmakingTicket.objects.filter(expires_at__gt=now).count(),
        "recent_games": [
            {
                "id": game.id,
                "white_player": game.white_player.username if game.white_player_id else None,
                "black_player": game.black_player.username if game.black_player_id else None,
                "status": game.status,
                "created_at": game.created_at.isoformat() if game.created_at else None,
            }
            for game in recent
        ],
    }
    async_to_sync(layer.group_send)("lobby", {"type": "lobby.broadcast", "payload": payload})


def broadcast_matchmaking_queue() -> None:
    layer = get_channel_layer()
    if layer is None:
        return
    count = MatchmakingTicket.objects.filter(expires_at__gt=timezone.now()).count()
    async_to_sync(layer.group_send)(
        "matchmaking",
        {"type": "matchmaking.broadcast", "payload": {"type": "queue_update", "count": count}},
    )


def broadcast_game_update(game_id: int, payload: dict) -> None:
    layer = get_channel_layer()
    if layer is None:
        return
    async_to_sync(layer.group_send)(f"game_{game_id}", {"type": "game.broadcast", "payload": payload})


def broadcast_match_found(game_id: int) -> None:
    layer = get_channel_layer()
    if layer is None:
        return
    try:
        game = Game.objects.select_related("white_player", "black_player").get(pk=game_id)
    except Game.DoesNotExist:
        return
    payload = {
        "type": "matched",
        "game_id": game.id,
        "white": {
            "id": game.white_player_id,
            "username": game.white_player.username if game.white_player_id else None,
        },
        "black": {
            "id": game.black_player_id,
            "username": game.black_player.username if game.black_player_id else None,
        },
    }
    async_to_sync(layer.group_send)("matchmaking", {"type": "matchmaking.broadcast", "payload": payload})
