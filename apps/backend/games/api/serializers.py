from __future__ import annotations

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from ..models import ChatMessage, Game, MatchmakingTicket, Move, default_time_control

User = get_user_model()


class PlayerSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "rating")


class TimeControlSerializer(serializers.Serializer):
    base = serializers.IntegerField(min_value=0, help_text="Base time in seconds")
    increment = serializers.IntegerField(min_value=0, help_text="Increment per move in seconds")

    def to_representation(self, instance: dict) -> dict:
        return {
            "base": instance.get("base", 0),
            "increment": instance.get("increment", 0),
        }


class GameSerializer(serializers.ModelSerializer):
    white_player = PlayerSummarySerializer(read_only=True)
    black_player = PlayerSummarySerializer(read_only=True)
    time_control = TimeControlSerializer()

    class Meta:
        model = Game
        fields = (
            "id",
            "white_player",
            "black_player",
            "status",
            "fen",
            "pgn",
            "time_control",
            "moves_count",
            "winner",
            "started_at",
            "ended_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "status",
            "fen",
            "pgn",
            "moves_count",
            "winner",
            "started_at",
            "ended_at",
            "created_at",
            "updated_at",
        )


class GameCreateSerializer(serializers.Serializer):
    opponent_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="opponent"
    )
    play_as = serializers.ChoiceField(
        choices=("white", "black", "auto"), default="auto"
    )
    time_control = TimeControlSerializer(required=False)

    def validate(self, attrs: dict) -> dict:
        request = self.context.get("request")
        user = getattr(request, "user", None)
        opponent = attrs["opponent"]
        if not user or not user.is_authenticated:
            raise serializers.ValidationError("Authentication required")
        if user == opponent:
            raise serializers.ValidationError({"opponent_id": "You cannot play against yourself."})
        return attrs

    def create(self, validated_data: dict) -> Game:
        request = self.context.get("request")
        user = request.user  # type: ignore[assignment]
        opponent = validated_data["opponent"]
        play_as = validated_data.get("play_as", "auto")
        tc = validated_data.get("time_control") or default_time_control()

        if play_as == "white":
            white, black = user, opponent
        elif play_as == "black":
            white, black = opponent, user
        else:
            white, black = user, opponent

        return Game.objects.create(
            white_player=white,
            black_player=black,
            time_control=tc,
        )


class MoveSerializer(serializers.ModelSerializer):
    player = PlayerSummarySerializer(read_only=True)

    class Meta:
        model = Move
        fields = (
            "id",
            "move_number",
            "san",
            "uci",
            "fen_after",
            "is_check",
            "is_mate",
            "player",
            "created_at",
        )
        read_only_fields = fields


class MoveCreateSerializer(serializers.Serializer):
    uci = serializers.CharField()

    def validate_uci(self, value: str) -> str:
        value = value.strip()
        if len(value) < 4:
            raise serializers.ValidationError("Invalid move format")
        return value


class MatchmakingTicketSerializer(serializers.ModelSerializer):
    user = PlayerSummarySerializer(read_only=True)
    time_control = TimeControlSerializer()

    class Meta:
        model = MatchmakingTicket
        fields = (
            "id",
            "user",
            "time_control",
            "rating_min",
            "rating_max",
            "created_at",
            "expires_at",
        )
        read_only_fields = fields


class MatchmakingTicketCreateSerializer(serializers.Serializer):
    time_control = TimeControlSerializer(required=False)
    rating_min = serializers.IntegerField(min_value=0, required=False)
    rating_max = serializers.IntegerField(min_value=0, required=False)
    expires_in = serializers.IntegerField(default=300, min_value=60, max_value=900)

    def validate(self, attrs: dict) -> dict:
        rating_min = attrs.get("rating_min", 0)
        rating_max = attrs.get("rating_max", rating_min + 400)
        if rating_max < rating_min:
            raise serializers.ValidationError("rating_max must be greater than rating_min")
        attrs["rating_min"] = rating_min
        attrs["rating_max"] = rating_max
        return attrs

    def create(self, validated_data: dict) -> MatchmakingTicket:
        request = self.context["request"]
        user = request.user  # type: ignore[assignment]
        expires_in = validated_data.get("expires_in", 300)
        expires_at = timezone.now() + timedelta(seconds=expires_in)
        ticket, _ = MatchmakingTicket.objects.update_or_create(
            user=user,
            defaults={
                "time_control": validated_data.get("time_control") or default_time_control(),
                "rating_min": validated_data["rating_min"],
                "rating_max": validated_data["rating_max"],
                "expires_at": expires_at,
            },
        )
        return ticket


class ChatMessageSerializer(serializers.ModelSerializer):
    sender = PlayerSummarySerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ("id", "sender", "text", "created_at")
        read_only_fields = fields


class LobbySerializer(serializers.Serializer):
    active_games = serializers.IntegerField()
    waiting_games = serializers.IntegerField()
    queue_count = serializers.IntegerField()
    recent_games = GameSerializer(many=True)
