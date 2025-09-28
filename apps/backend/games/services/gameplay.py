from __future__ import annotations

from dataclasses import dataclass

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from ..models import Game, Move
from .chess_engine import GameEngine, MoveValidationResult

User = get_user_model()


class GameStateError(Exception):
    """Raised when a game is not in a state that accepts moves."""


class NotParticipantError(Exception):
    """Raised when a user is not part of the targeted game."""


class NotYourTurnError(Exception):
    """Raised when a user attempts to move out of turn."""


@dataclass(slots=True)
class AppliedMove:
    move: Move
    result: MoveValidationResult
    previous_status: str
    current_status: str


def apply_player_move(game: Game, player: User, uci: str) -> AppliedMove:
    if game.status in {Game.Status.FINISHED, Game.Status.ABORTED}:
        raise GameStateError("Game is not accepting moves.")
    if player not in (game.white_player, game.black_player):
        raise NotParticipantError("Player is not part of this game.")

    expected_turn = "white" if game.white_player == player else "black"
    engine = GameEngine.from_game(game)
    board_turn = "white" if engine.board.turn else "black"
    if board_turn != expected_turn:
        raise NotYourTurnError("It is not your turn to move.")

    move_result = engine.validate_move(uci)
    previous_status = game.status

    with transaction.atomic():
        move = Move.objects.create(
            game=game,
            player=player,
            move_number=move_result.move_number,
            san=move_result.san,
            uci=uci,
            fen_after=move_result.fen,
            is_check=move_result.is_check,
            is_mate=move_result.is_checkmate,
        )
        update_fields = ["fen", "pgn", "moves_count", "updated_at", "status"]
        game.fen = move_result.fen
        game.pgn = move_result.pgn
        game.moves_count = move_result.move_number
        if game.status == Game.Status.WAITING:
            game.status = Game.Status.LIVE
            if game.started_at is None:
                game.started_at = timezone.now()
                update_fields.append("started_at")
        if move_result.is_checkmate:
            game.status = Game.Status.FINISHED
            game.winner = Game.Winner.WHITE if expected_turn == "white" else Game.Winner.BLACK
            game.ended_at = timezone.now()
            update_fields.extend(["winner", "ended_at"])
            from ..tasks import update_game_elo  # noqa: WPS433 - local import to avoid circular dependency
            transaction.on_commit(lambda: update_game_elo.delay(game.id))
        game.save(update_fields=update_fields)

    return AppliedMove(
        move=move,
        result=move_result,
        previous_status=previous_status,
        current_status=game.status,
    )
