from __future__ import annotations

from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import ChatMessage, Game, MatchmakingTicket
from ..services.gameplay import (
    GameStateError,
    NotParticipantError,
    NotYourTurnError,
    apply_player_move,
)
from ..utils.broadcast import broadcast_game_update, broadcast_lobby_state, broadcast_matchmaking_queue
from .serializers import (
    ChatMessageSerializer,
    GameCreateSerializer,
    GameSerializer,
    LobbySerializer,
    MatchmakingTicketCreateSerializer,
    MatchmakingTicketSerializer,
    MoveCreateSerializer,
    MoveSerializer,
)


class GameViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Game.objects.select_related("white_player", "black_player").all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):  # type: ignore[override]
        if self.action == "create":
            return GameCreateSerializer
        return GameSerializer

    def create(self, request: Request, *args, **kwargs):  # type: ignore[override]
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        game = serializer.save()
        broadcast_lobby_state()
        output = GameSerializer(game, context=self.get_serializer_context())
        headers = self.get_success_headers(output.data)
        return Response(output.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=["get"], serializer_class=MoveSerializer)
    def moves(self, request: Request, pk: str | None = None) -> Response:
        game = self.get_object()
        moves = game.moves.select_related("player").order_by("move_number", "created_at")
        serializer = MoveSerializer(moves, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"], serializer_class=MoveCreateSerializer)
    def move(self, request: Request, pk: str | None = None) -> Response:
        game = self.get_object()
        if game.status == Game.Status.FINISHED or game.status == Game.Status.ABORTED:
            raise ValidationError("Game is not accepting moves.")
        serializer = MoveCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        player = request.user
        if player not in (game.white_player, game.black_player):
            raise PermissionDenied("You are not part of this game.")
        expected_turn = "white" if game.white_player == player else "black"
        try:
            applied = apply_player_move(game, player, serializer.validated_data["uci"])
        except GameStateError as exc:
            raise ValidationError(str(exc)) from exc
        except NotParticipantError as exc:
            raise PermissionDenied(str(exc)) from exc
        except NotYourTurnError as exc:
            raise PermissionDenied(str(exc)) from exc
        except ValueError as exc:
            raise ValidationError(str(exc)) from exc

        payload = {
            "move": {
                "id": applied.move.id,
                "san": applied.move.san,
                "uci": applied.move.uci,
                "move_number": applied.move.move_number,
                "is_check": applied.move.is_check,
                "is_mate": applied.move.is_mate,
                "player": applied.move.player.username,
            },
            "game": {
                "fen": applied.result.fen,
                "pgn": applied.result.pgn,
                "status": applied.current_status,
                "winner": game.winner,
                "moves_count": game.moves_count,
            },
        }
        broadcast_game_update(game.id, {"type": "move_applied", **payload})
        if applied.result.is_checkmate or applied.previous_status != applied.current_status:
            broadcast_lobby_state()

        return Response(MoveSerializer(applied.move, context={"request": request}).data, status=status.HTTP_201_CREATED)


class MatchmakingTicketView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Request) -> Response:
        try:
            ticket = request.user.ticket  # type: ignore[attr-defined]
        except MatchmakingTicket.DoesNotExist:
            return Response(None)
        return Response(MatchmakingTicketSerializer(ticket, context={"request": request}).data)

    def post(self, request: Request) -> Response:
        serializer = MatchmakingTicketCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save()
        broadcast_matchmaking_queue()
        broadcast_lobby_state()
        return Response(MatchmakingTicketSerializer(ticket, context={"request": request}).data, status=status.HTTP_201_CREATED)

    def delete(self, request: Request) -> Response:
        MatchmakingTicket.objects.filter(user=request.user).delete()
        broadcast_matchmaking_queue()
        broadcast_lobby_state()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LobbyView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request: Request) -> Response:
        now = timezone.now()
        active_games = Game.objects.filter(status=Game.Status.LIVE).count()
        waiting_games = Game.objects.filter(status=Game.Status.WAITING).count()
        queue_count = MatchmakingTicket.objects.filter(expires_at__gt=now).count()
        recent_games = Game.objects.select_related("white_player", "black_player").order_by("-created_at")[:5]
        serializer = LobbySerializer(
            {
                "active_games": active_games,
                "waiting_games": waiting_games,
                "queue_count": queue_count,
                "recent_games": GameSerializer(recent_games, many=True, context={"request": request}).data,
            }
        )
        return Response(serializer.data)


class ChatMessageViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):  # type: ignore[override]
        game_id = self.kwargs.get("game_pk")
        return ChatMessage.objects.filter(game_id=game_id).select_related("sender").order_by("created_at")

    def get_serializer_class(self):  # type: ignore[override]
        return ChatMessageSerializer

    def perform_create(self, serializer: ChatMessageSerializer) -> None:  # type: ignore[override]
        game_id = self.kwargs.get("game_pk")
        try:
            game = Game.objects.get(pk=game_id)
        except Game.DoesNotExist as exc:  # pragma: no cover - defensive
            raise ValidationError("Game not found") from exc
        serializer.save(game=game, sender=self.request.user)
