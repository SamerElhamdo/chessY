from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

User = settings.AUTH_USER_MODEL


DEFAULT_START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

def default_time_control() -> dict[str, int]:
    return {"base": 300, "increment": 0}


class Game(models.Model):
    class Status(models.TextChoices):
        WAITING = "waiting", _("Waiting")
        LIVE = "live", _("Live")
        FINISHED = "finished", _("Finished")
        ABORTED = "aborted", _("Aborted")

    class Winner(models.TextChoices):
        WHITE = "white", _("White")
        BLACK = "black", _("Black")
        DRAW = "draw", _("Draw")
        NONE = "none", _("No winner")

    white_player = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="games_as_white",
    )
    black_player = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="games_as_black",
    )
    initial_fen = models.CharField(max_length=128, default=DEFAULT_START_FEN)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.WAITING,
    )
    fen = models.CharField(max_length=128, default=DEFAULT_START_FEN)
    pgn = models.TextField(blank=True)
    time_control = models.JSONField(default=default_time_control)
    moves_count = models.PositiveIntegerField(default=0)
    winner = models.CharField(
        max_length=8,
        choices=Winner.choices,
        default=Winner.NONE,
    )
    elo_processed = models.BooleanField(default=False)
    started_at = models.DateTimeField(blank=True, null=True)
    ended_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["winner"]),
        ]

    def __str__(self) -> str:  # pragma: no cover - representation only
        return f"Game {self.pk}"

    @property
    def white(self):
        return self.white_player

    @property
    def black(self):
        return self.black_player

    def start(self) -> None:
        self.status = self.Status.LIVE
        self.started_at = timezone.now()
        self.save(update_fields=["status", "started_at"])

    def finish(self, winner: str) -> None:
        self.status = self.Status.FINISHED
        self.winner = winner
        self.ended_at = timezone.now()
        self.save(update_fields=["status", "winner", "ended_at"])


class Move(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="moves")
    player = models.ForeignKey(User, on_delete=models.CASCADE, related_name="moves")
    move_number = models.PositiveIntegerField()
    san = models.CharField(max_length=16)
    uci = models.CharField(max_length=8)
    fen_after = models.CharField(max_length=128)
    is_check = models.BooleanField(default=False)
    is_mate = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["move_number", "created_at"]
        indexes = [
            models.Index(fields=["game", "move_number"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.game_id}#{self.move_number} {self.san}"


class MatchmakingTicket(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="ticket")
    time_control = models.JSONField(default=default_time_control)
    rating_min = models.PositiveIntegerField(default=0)
    rating_max = models.PositiveIntegerField(default=4000)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["rating_min", "rating_max"]),
        ]

    def is_expired(self) -> bool:
        return timezone.now() >= self.expires_at

    def __str__(self) -> str:  # pragma: no cover
        return f"Ticket({self.user_id})"


class ChatMessage(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="chat_messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_messages")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["game", "created_at"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"ChatMessage({self.sender_id} -> Game {self.game_id})"
