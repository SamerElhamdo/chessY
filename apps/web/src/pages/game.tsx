import { useCallback, useEffect, useMemo, useState } from 'react';
import { Chessboard } from '../features/game/components/chessboard';
import { MoveList } from '../features/game/components/move-list';
import { ChatPanel } from '../features/game/components/chat-panel';
import { GameTimers } from '../features/game/components/game-timers';
import { boardToFen, cloneBoard, parseFenBoard, squareToAlgebraic } from '../features/game/utils/fen';
import type { BoardMatrix, ChatMessage, MoveRecord } from '../features/game/types';
import { useRealtimeStore } from '../store/realtime-store';
import { useGameSocket } from '../hooks/use-game-socket';

const INITIAL_FEN = 'r2qk2r/pp1b1ppp/2n1pn2/2bp4/2B5/2NP1N2/PPP2PPP/R1BQR1K1 w kq - 0 10';

const INITIAL_MOVES: MoveRecord[] = [
  { move: '1', notation: 'd4' },
  { move: '2', notation: 'Nf3' },
  { move: '3', notation: 'Bg5' },
  { move: '4', notation: 'O-O' }
];

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'msg-1',
    author: 'أحمد',
    content: 'حظاً موفقاً! لنستمتع بمباراة قوية.',
    createdAt: Date.now() - 1000 * 60 * 4
  },
  {
    id: 'msg-2',
    author: 'سارة',
    content: 'بالتوفيق لك أيضاً، سأحاول الدفاع الصقلي!',
    createdAt: Date.now() - 1000 * 60 * 3
  }
];

export function GamePage(): JSX.Element {
  const [board, setBoard] = useState<BoardMatrix>(() => parseFenBoard(INITIAL_FEN));
  const [selectedSquare, setSelectedSquare] = useState<{ rank: number; file: number } | null>(null);
  const [moves, setMoves] = useState<MoveRecord[]>(INITIAL_MOVES);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [whiteTime, setWhiteTime] = useState(300);
  const [blackTime, setBlackTime] = useState(300);
  const [currentTurn, setCurrentTurn] = useState<'white' | 'black'>('white');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const setGameState = useRealtimeStore((state) => state.setGameState);
  const patchGameState = useRealtimeStore((state) => state.patchGameState);
  const gameState = useRealtimeStore((state) => state.gameState);

  useGameSocket();

  useEffect(() => {
    if (!gameState) {
      setGameState({ gameId: 1, fen: INITIAL_FEN, moves: INITIAL_MOVES });
    }
  }, [gameState, setGameState]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWhiteTime((prev) => (currentTurn === 'white' ? Math.max(prev - 1, 0) : prev));
      setBlackTime((prev) => (currentTurn === 'black' ? Math.max(prev - 1, 0) : prev));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [currentTurn]);

  useEffect(() => {
    if (gameState?.fen) {
      setBoard(parseFenBoard(gameState.fen));
    }
    if (gameState?.moves) {
      setMoves(gameState.moves);
    }
    if (gameState?.lastMove) {
      setLastMove(gameState.lastMove);
    }
  }, [gameState?.fen, gameState?.lastMove, gameState?.moves]);

  const handleSelectSquare = useCallback(
    (position: { rank: number; file: number }) => {
      const piece = board[position.rank][position.file];

      if (selectedSquare && selectedSquare.rank === position.rank && selectedSquare.file === position.file) {
        setSelectedSquare(null);
        return;
      }

      if (piece && piece.color === currentTurn) {
        setSelectedSquare(position);
        return;
      }

      if (!selectedSquare) {
        return;
      }

      const originPiece = board[selectedSquare.rank][selectedSquare.file];
      if (!originPiece || originPiece.color !== currentTurn) {
        setSelectedSquare(null);
        return;
      }

      const targetPiece = board[position.rank][position.file];
      if (targetPiece && targetPiece.color === originPiece.color) {
        setSelectedSquare(position);
        return;
      }

      const updatedBoard = cloneBoard(board);
      updatedBoard[position.rank][position.file] = { ...originPiece };
      updatedBoard[selectedSquare.rank][selectedSquare.file] = null;
      setBoard(updatedBoard);

      const from = squareToAlgebraic(selectedSquare.rank, selectedSquare.file);
      const to = squareToAlgebraic(position.rank, position.file);

      const updatedMoves = [
        ...moves,
        {
          move: `${moves.length + 1}`,
          notation: `${from}→${to}`
        }
      ];
      setMoves(updatedMoves);
      setLastMove({ from, to });
      setSelectedSquare(null);
      setCurrentTurn((prev) => (prev === 'white' ? 'black' : 'white'));
      const fen = boardToFen(updatedBoard);
      patchGameState({
        gameId: gameState?.gameId ?? 1,
        fen,
        moves: updatedMoves,
        lastMove: { from, to }
      });
    },
    [board, currentTurn, gameState?.gameId, moves, patchGameState, selectedSquare]
  );

  const handleSendMessage = useCallback((content: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${prev.length + 1}`,
        author: currentTurn === 'white' ? 'أحمد' : 'سارة',
        content,
        createdAt: Date.now()
      }
    ]);
  }, [currentTurn]);

  const boardKey = useMemo(() => board.flat().map((square) => square?.id ?? '0').join('-'), [board]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="space-y-6">
        <Chessboard
          key={boardKey}
          board={board}
          selectedSquare={selectedSquare}
          onSelectSquare={handleSelectSquare}
          lastMove={lastMove}
        />
        <GameTimers whiteTime={whiteTime} blackTime={blackTime} currentTurn={currentTurn} />
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
        <MoveList moves={moves} />
        <ChatPanel messages={chatMessages} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
