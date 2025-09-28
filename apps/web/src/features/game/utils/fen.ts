import type { BoardMatrix, BoardSquare, Piece, PieceColor, PieceType } from '../types';

const pieceMap: Record<string, { type: PieceType; color: PieceColor }> = {
  p: { type: 'pawn', color: 'black' },
  r: { type: 'rook', color: 'black' },
  n: { type: 'knight', color: 'black' },
  b: { type: 'bishop', color: 'black' },
  q: { type: 'queen', color: 'black' },
  k: { type: 'king', color: 'black' },
  P: { type: 'pawn', color: 'white' },
  R: { type: 'rook', color: 'white' },
  N: { type: 'knight', color: 'white' },
  B: { type: 'bishop', color: 'white' },
  Q: { type: 'queen', color: 'white' },
  K: { type: 'king', color: 'white' }
};

export function parseFenBoard(fen: string): BoardMatrix {
  const [placement] = fen.split(' ');
  const ranks = placement.split('/');

  if (ranks.length !== 8) {
    throw new Error('Invalid FEN string');
  }

  let pieceCounter = 0;

  const board: BoardMatrix = ranks.map((rank) => {
    const squares: BoardSquare[] = [];
    for (const char of rank) {
      if (/\d/.test(char)) {
        const emptyCount = Number(char);
        for (let index = 0; index < emptyCount; index += 1) {
          squares.push(null);
        }
      } else {
        const details = pieceMap[char];
        if (!details) {
          throw new Error(`Unknown piece: ${char}`);
        }
        const piece: Piece = {
          id: `piece-${pieceCounter}`,
          color: details.color,
          type: details.type
        };
        pieceCounter += 1;
        squares.push(piece);
      }
    }

    if (squares.length !== 8) {
      throw new Error('Invalid rank length in FEN');
    }

    return squares;
  });

  return board;
}

export function cloneBoard(board: BoardMatrix): BoardMatrix {
  return board.map((rank) => rank.map((square) => (square ? { ...square } : null)));
}

export function squareToAlgebraic(rank: number, file: number): string {
  const files = 'abcdefgh';
  return `${files[file]}${8 - rank}`;
}

export function boardToFen(board: BoardMatrix): string {
  const ranks = board.map((rank) => {
    let emptyCount = 0;
    const parts: string[] = [];

    rank.forEach((square) => {
      if (!square) {
        emptyCount += 1;
      } else {
        if (emptyCount > 0) {
          parts.push(String(emptyCount));
          emptyCount = 0;
        }
        const typeMap: Record<string, string> = {
          pawn: 'p',
          rook: 'r',
          knight: 'n',
          bishop: 'b',
          queen: 'q',
          king: 'k'
        };
        const pieceChar = typeMap[square.type];
        parts.push(square.color === 'white' ? pieceChar.toUpperCase() : pieceChar);
      }
    });

    if (emptyCount > 0) {
      parts.push(String(emptyCount));
    }

    return parts.join('');
  });

  return ranks.join('/');
}
