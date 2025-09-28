from __future__ import annotations

from celery import shared_task
from django.db import transaction
from django.utils import timezone

from .models import Game, MatchmakingTicket
from .services.elo import apply_game_result
from .utils.broadcast import broadcast_lobby_state, broadcast_match_found, broadcast_matchmaking_queue


@shared_task(name="games.tasks.process_matchmaking_queue")
def process_matchmaking_queue() -> list[int]:
    now = timezone.now()
    MatchmakingTicket.objects.filter(expires_at__lte=now).delete()

    tickets = list(
        MatchmakingTicket.objects.select_related("user").filter(expires_at__gt=now).order_by("created_at")
    )
    matched_ids: set[int] = set()
    created_games: list[int] = []

    for idx, ticket in enumerate(tickets):
        if ticket.id in matched_ids:
            continue
        for other in tickets[idx + 1 :]:
            if other.id in matched_ids:
                continue
            if ticket.time_control != other.time_control:
                continue
            if not _within_rating_range(ticket, other):
                continue
            with transaction.atomic():
                game = Game.objects.create(
                    white_player=ticket.user,
                    black_player=other.user,
                    time_control=ticket.time_control,
                )
                ticket_id = ticket.id
                other_id = other.id
                game_id = game.id
                ticket.delete()
                other.delete()
                matched_ids.update({ticket_id, other_id})
                created_games.append(game_id)
                transaction.on_commit(lambda gid=game_id: broadcast_match_found(gid))
            break

    if matched_ids:
        broadcast_matchmaking_queue()
        broadcast_lobby_state()
    return created_games


@shared_task(name="games.tasks.update_game_elo")
def update_game_elo(game_id: int) -> None:
    try:
        game = Game.objects.select_related("white_player", "black_player").get(pk=game_id)
    except Game.DoesNotExist:
        return
    apply_game_result(game)
    broadcast_lobby_state()


def _within_rating_range(ticket_a: MatchmakingTicket, ticket_b: MatchmakingTicket) -> bool:
    rating_a = ticket_a.user.rating
    rating_b = ticket_b.user.rating
    return (
        ticket_a.rating_min <= rating_b <= ticket_a.rating_max
        and ticket_b.rating_min <= rating_a <= ticket_b.rating_max
    )
