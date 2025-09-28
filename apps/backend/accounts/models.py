from __future__ import annotations

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Custom user model for ShamChess players."""

    rating = models.PositiveIntegerField(default=1200, help_text=_("Current ELO rating"))
    wins = models.PositiveIntegerField(default=0, help_text=_("Number of wins"))
    losses = models.PositiveIntegerField(default=0, help_text=_("Number of losses"))
    draws = models.PositiveIntegerField(default=0, help_text=_("Number of draws"))
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    bio = models.TextField(blank=True)

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        ordering = ["-date_joined"]

    @property
    def games_played(self) -> int:
        return self.wins + self.losses + self.draws

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return self.username
