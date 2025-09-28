from django.contrib import admin

from .models import ChatMessage, Game, MatchmakingTicket, Move


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "white_player",
        "black_player",
        "status",
        "winner",
        "moves_count",
        "created_at",
    )
    list_filter = ("status", "winner")
    search_fields = ("white_player__username", "black_player__username")


@admin.register(Move)
class MoveAdmin(admin.ModelAdmin):
    list_display = ("game", "move_number", "san", "uci", "is_check", "is_mate")
    list_filter = ("is_check", "is_mate")
    search_fields = ("game__id", "san", "uci")


@admin.register(MatchmakingTicket)
class MatchmakingTicketAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "expires_at", "rating_min", "rating_max")
    list_filter = ("created_at",)
    search_fields = ("user__username",)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("game", "sender", "created_at")
    search_fields = ("game__id", "sender__username", "text")
