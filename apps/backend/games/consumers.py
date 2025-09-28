from __future__ import annotations

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import Game, MatchmakingTicket
from .services.gameplay import (
    GameStateError,
    NotParticipantError,
    NotYourTurnError,
    apply_player_move,
)

User = get_user_model()


class LobbyConsumer(AsyncJsonWebsocketConsumer):
    group_name = "lobby"

    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.send_json(await self._current_state())

    async def disconnect(self, close_code: int):  # pragma: no cover - connection cleanup
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def lobby_broadcast(self, event: dict):
        await self.send_json(event["payload"])

    @database_sync_to_async
    def _current_state(self) -> dict:
        now = timezone.now()
        active = Game.objects.filter(status=Game.Status.LIVE).count()
        waiting = Game.objects.filter(status=Game.Status.WAITING).count()
        queue = MatchmakingTicket.objects.filter(expires_at__gt=now).count()
        recent = list(
            Game.objects.select_related("white_player", "black_player").order_by("-created_at")[:5]
        )
        return {
            "type": "lobby_state",
            "active_games": active,
            "waiting_games": waiting,
            "queue_count": queue,
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


class MatchmakingConsumer(AsyncJsonWebsocketConsumer):
    group_name = "matchmaking"

    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.send_json(await self._current_state())

    async def disconnect(self, close_code: int):  # pragma: no cover
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def matchmaking_broadcast(self, event: dict):
        await self.send_json(event["payload"])

    @database_sync_to_async
    def _current_state(self) -> dict:
        now = timezone.now()
        queue = MatchmakingTicket.objects.filter(expires_at__gt=now).count()
        return {"type": "queue_update", "count": queue}


class GameConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.game_id = int(self.scope["url_route"]["kwargs"]["game_id"])
        self.group_name = f"game_{self.game_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        initial_state = await self._game_state()
        await self.send_json({"type": "game_state", "state": initial_state})

    async def disconnect(self, close_code: int):  # pragma: no cover
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        message_type = content.get("type")
        if message_type == "move":
            await self._handle_move(content)

    async def _handle_move(self, content: dict):
        user = self.scope.get("user")
        if user is None or not user.is_authenticated:
            await self.send_json({"type": "error", "message": "Authentication required."})
            return
        uci = content.get("uci")
        if not uci:
            await self.send_json({"type": "error", "message": "Move missing."})
            return
        try:
            payload = await self._apply_move(user.id, uci)
        except GameStateError as exc:
            await self.send_json({"type": "error", "message": str(exc)})
            return
        except NotParticipantError:
            await self.send_json({"type": "error", "message": "Not allowed."})
            return
        except NotYourTurnError:
            await self.send_json({"type": "error", "message": "Not your turn."})
            return
        except ValueError as exc:
            await self.send_json({"type": "error", "message": str(exc)})
            return

        await self.channel_layer.group_send(
            self.group_name,
            {"type": "game.broadcast", "payload": {"type": "move_applied", **payload}},
        )

    async def game_broadcast(self, event: dict):
        await self.send_json(event["payload"])

    @database_sync_to_async
    def _game_state(self) -> dict:
        game = (
            Game.objects.select_related("white_player", "black_player")
            .prefetch_related("moves")
            .get(pk=self.game_id)
        )
        return {
            "game": {
                "id": game.id,
                "status": game.status,
                "fen": game.fen,
                "pgn": game.pgn,
                "time_control": game.time_control,
                "moves_count": game.moves_count,
                "winner": game.winner,
            },
            "moves": [
                {
                    "id": move.id,
                    "san": move.san,
                    "uci": move.uci,
                    "move_number": move.move_number,
                    "is_check": move.is_check,
                    "is_mate": move.is_mate,
                    "player": move.player.username,
                }
                for move in game.moves.order_by("move_number")
            ],
        }

    @database_sync_to_async
    def _apply_move(self, user_id: int, uci: str) -> dict:
        user = User.objects.get(pk=user_id)
        game = Game.objects.select_related("white_player", "black_player").get(pk=self.game_id)
        applied = apply_player_move(game, user, uci)
        move = applied.move
        result = applied.result
        return {
            "move": {
                "id": move.id,
                "san": move.san,
                "uci": move.uci,
                "move_number": move.move_number,
                "is_check": move.is_check,
                "is_mate": move.is_mate,
                "player": move.player.username,
            },
            "game": {
                "fen": result.fen,
                "pgn": result.pgn,
                "status": applied.current_status,
                "winner": game.winner,
                "moves_count": game.moves_count,
            },
        }
