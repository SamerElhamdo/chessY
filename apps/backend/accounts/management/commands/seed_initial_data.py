from __future__ import annotations

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import User
from games.models import Game, MatchmakingTicket
from games.services.gameplay import apply_player_move
from games.utils.broadcast import broadcast_lobby_state, broadcast_matchmaking_queue


class Command(BaseCommand):
    help = "Seed initial users, games, and matchmaking tickets for ShamChess"

    @transaction.atomic
    def handle(self, *args, **options):
        admin_user, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@shamchess.local",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin_user.set_password("AdminPass123!")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user (username: admin / password: AdminPass123!)"))
        else:
            self.stdout.write("Admin user already exists. Skipping creation.")

        demo_users = [
            {"username": "ahmad", "email": "ahmad@example.com", "rating": 1400},
            {"username": "sara", "email": "sara@example.com", "rating": 1350},
            {"username": "nour", "email": "nour@example.com", "rating": 1500},
        ]
        created_users = []
        for data in demo_users:
            user, created = User.objects.get_or_create(username=data["username"], defaults=data)
            if created:
                user.set_password("ShamChess123")
                user.save()
            created_users.append(user)
        self.stdout.write(self.style.SUCCESS("Ensured demo players exist."))

        if len(created_users) >= 2:
            white, black = created_users[0], created_users[1]
            game, created = Game.objects.get_or_create(
                white_player=white,
                black_player=black,
                defaults={
                    "status": Game.Status.LIVE,
                },
            )
            if created and game.moves.count() == 0:
                apply_player_move(game, white, "e2e4")
                apply_player_move(game, black, "e7e5")
                self.stdout.write(self.style.SUCCESS(f"Created demo game #{game.id} with two opening moves."))

        expiry = timezone.now() + timezone.timedelta(minutes=10)
        for user in created_users:
            MatchmakingTicket.objects.update_or_create(
                user=user,
                defaults={
                    "time_control": {"base": 300, "increment": 0},
                    "rating_min": max(user.rating - 150, 0),
                    "rating_max": user.rating + 150,
                    "expires_at": expiry,
                },
            )
        broadcast_matchmaking_queue()
        broadcast_lobby_state()
        self.stdout.write(self.style.SUCCESS("Seeding complete."))
