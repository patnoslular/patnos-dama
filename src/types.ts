
export type Player = 'blue' | 'yellow';
export type PieceType = 'pawn' | 'king';

export interface Piece {
  id: string;
  player: Player;
  type: PieceType;
  row: number;
  col: number;
}

export interface Move {
  from: { row: number; col: number };
  to: { row: number; col: number };
  path?: { row: number; col: number }[];
  captures?: { row: number; col: number }[];
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'tr' | 'ku';

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  status: 'menu' | 'playing' | 'rules';
  playerName: string;
  difficulty: Difficulty;
  language: Language;
  timeLeft: number;
  lastMove: Move | null;
  history: string[];
}
