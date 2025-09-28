import type { BoardMatrix } from '../types';
import { cn } from '../../../lib/utils';

const pieceToSymbol: Record<string, string> = {
  'white-king': '♔',
  'white-queen': '♕',
  'white-rook': '♖',
  'white-bishop': '♗',
  'white-knight': '♘',
  'white-pawn': '♙',
  'black-king': '♚',
  'black-queen': '♛',
  'black-rook': '♜',
  'black-bishop': '♝',
  'black-knight': '♞',
  'black-pawn': '♟'
};

interface ChessboardProps {
  board: BoardMatrix;
  selectedSquare: { rank: number; file: number } | null;
  lastMove: { from: string; to: string } | null;
  onSelectSquare: (position: { rank: number; file: number }) => void;
}

export function Chessboard({ board, selectedSquare, onSelectSquare, lastMove }: ChessboardProps): JSX.Element {
  return (
    <div className="relative">
      <div className="grid aspect-square grid-cols-8 overflow-hidden rounded-3xl border border-slate-800/70 shadow-2xl">
        {board.map((rank, rankIndex) =>
          rank.map((square, fileIndex) => {
            const isDark = (rankIndex + fileIndex) % 2 === 1;
            const isSelected = selectedSquare?.rank === rankIndex && selectedSquare?.file === fileIndex;
            const notation = String.fromCharCode(97 + fileIndex) + (8 - rankIndex);
            const isLastMoveSquare =
              lastMove && (lastMove.from === notation || lastMove.to === notation);

            return (
              <button
                type="button"
                key={`${rankIndex}-${fileIndex}`}
                onClick={() => onSelectSquare({ rank: rankIndex, file: fileIndex })}
                className={cn(
                  'relative flex items-center justify-center text-3xl font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                  isDark ? 'bg-slate-700/60' : 'bg-slate-200/10',
                  isSelected && 'ring-2 ring-inset ring-brand-300',
                  isLastMoveSquare && 'after:absolute after:inset-1 after:rounded-2xl after:border after:border-amber-400/60'
                )}
              >
                {square ? (
                  <span className={square.color === 'white' ? 'text-slate-100' : 'text-slate-900'}>
                    {pieceToSymbol[`${square.color}-${square.type}`]}
                  </span>
                ) : null}
                <span className="absolute bottom-1 left-1 text-xs text-slate-500">{notation}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
