from __future__ import annotations

from dataclasses import dataclass

from django.contrib.auth import get_user_model
from django.db import transaction

from ..models import Game

User = get_user_model()


@dataclass
class EloResult:
    white_rating: int
    black_rating: int


def apply_game_result(game: Game) -> EloResult:
    if game.status != Game.Status.FINISHED or game.elo_processed:
        return EloResult(game.white_player.rating, game.black_player.rating)

    white = game.white_player
    black = game.black_player

    white_score, black_score = _scores_for_winner(game.winner)
    white_new = _calculate_new_rating(white, black.rating, white_score)
    black_new = _calculate_new_rating(black, white.rating, black_score)

    with transaction.atomic():
        _update_player_stats(white, white_score, white_new)
        _update_player_stats(black, black_score, black_new)
        white.save(update_fields=["rating", "wins", "losses", "draws"])
        black.save(update_fields=["rating", "wins", "losses", "draws"])
        game.elo_processed = True
        game.save(update_fields=["elo_processed"])

    return EloResult(white_new, black_new)


def _scores_for_winner(winner: str) -> tuple[float, float]:
    if winner == Game.Winner.WHITE:
        return 1.0, 0.0
    if winner == Game.Winner.BLACK:
        return 0.0, 1.0
    if winner == Game.Winner.DRAW:
        return 0.5, 0.5
    return 0.0, 0.0


def _calculate_new_rating(player: User, opponent_rating: int, score: float) -> int:
    k = _k_factor(player)
    expected = 1 / (1 + 10 ** ((opponent_rating - player.rating) / 400))
    new_rating = player.rating + k * (score - expected)
    return int(round(new_rating))


def _k_factor(player: User) -> int:
    games_played = player.games_played
    if games_played < 30:
        return 32
    if games_played < 100:
        return 24
    return 16


def _update_player_stats(player: User, score: float, rating: int) -> None:
    if score == 1.0:
        player.wins += 1
    elif score == 0.5:
        player.draws += 1
    else:
        player.losses += 1
    player.rating = rating
