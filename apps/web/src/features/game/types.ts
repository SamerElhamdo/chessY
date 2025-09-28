export type PieceColor = 'white' | 'black';
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

export interface Piece {
  id: string;
  color: PieceColor;
  type: PieceType;
}

export type BoardSquare = Piece | null;

export type BoardMatrix = BoardSquare[][]; // [rank][file]

export interface MoveRecord {
  move: string;
  notation: string;
}

export interface ChatMessage {
  id: string;
  author: string;
  content: string;
  createdAt: number;
}
