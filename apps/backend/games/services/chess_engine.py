from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Sequence

import chess
import chess.pgn

from ..models import DEFAULT_START_FEN, Game


@dataclass(slots=True)
class MoveValidationResult:
    fen: str
    san: str
    move_number: int
    is_check: bool
    is_checkmate: bool
    pgn: str


class GameEngine:
    """Utility wrapper around python-chess for ShamChess."""

    def __init__(self, starting_fen: str = DEFAULT_START_FEN, moves: Sequence[str] | None = None) -> None:
        self.starting_fen = starting_fen
        self.board = chess.Board(starting_fen)
        if moves:
            for uci in moves:
                self.board.push(chess.Move.from_uci(uci))

    @classmethod
    def from_game(cls, game: Game) -> "GameEngine":
        existing_moves = list(game.moves.order_by("move_number", "created_at").values_list("uci", flat=True))
        return cls(starting_fen=game.initial_fen or DEFAULT_START_FEN, moves=existing_moves)

    def validate_move(self, uci: str) -> MoveValidationResult:
        try:
            move = chess.Move.from_uci(uci)
        except ValueError as exc:  # pragma: no cover - invalid format
            raise ValueError("Invalid UCI move format") from exc

        if move not in self.board.legal_moves:
            raise ValueError("Illegal move")

        san = self.board.san(move)
        self.board.push(move)

        fen = self.board.fen()
        is_check = self.board.is_check()
        is_mate = self.board.is_checkmate()
        move_number = self._current_move_number()
        pgn = self._export_pgn()

        return MoveValidationResult(
            fen=fen,
            san=san,
            move_number=move_number,
            is_check=is_check,
            is_checkmate=is_mate,
            pgn=pgn,
        )

    def _current_move_number(self) -> int:
        return self.board.fullmove_number - (1 if self.board.turn is chess.WHITE else 0)

    def _export_pgn(self) -> str:
        game = chess.pgn.Game()
        initial_board = chess.Board(self.starting_fen)
        if self.starting_fen != chess.STARTING_FEN:
            game.setup(initial_board)
            game.headers["SetUp"] = "1"
            game.headers["FEN"] = self.starting_fen
        node = game
        for move in self.board.move_stack:
            node = node.add_variation(move)
        exporter = chess.pgn.StringExporter(headers=True, variations=False, comments=False)
        return game.accept(exporter)


def validate_move_for_game(game: Game, uci: str) -> MoveValidationResult:
    engine = GameEngine.from_game(game)
    return engine.validate_move(uci)


def generate_pgn_from_moves(moves: Iterable[str], starting_fen: str = DEFAULT_START_FEN) -> str:
    engine = GameEngine(starting_fen=starting_fen, moves=list(moves))
    return engine._export_pgn()
