
import { GameState, Move, Player } from '../types';
import { BOARD_SIZE } from '../constants';
import { getValidMoves, applyMove } from './damaLogic';

export const getAIMove = (state: GameState): Move | null => {
  const moves = getValidMoves(state.board, 'yellow');
  if (moves.length === 0) return null;

  if (state.difficulty === 'easy') {
    // New Easy: Minimax with depth 2 (previously Medium)
    return minimax(state.board, 2, -Infinity, Infinity, true).move;
  }

  if (state.difficulty === 'medium') {
    // New Medium: Minimax with depth 5 (previously Hard)
    return minimax(state.board, 5, -Infinity, Infinity, true).move;
  }

  // New Hard: Minimax with depth 7 and Alpha-Beta pruning
  // Depth 7 is significantly more challenging and strategic
  return minimax(state.board, 7, -Infinity, Infinity, true).move;
};

const evaluateBoard = (board: any[][]): number => {
  let score = 0;
  
  let yellowPieces = 0;
  let bluePieces = 0;
  let yellowKings = 0;
  let blueKings = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (!p) continue;

      const isYellow = p.player === 'yellow';
      let pieceVal = 0;

      if (p.type === 'king') {
        pieceVal = 10000; // Kings are extremely valuable
        if (isYellow) yellowKings++; else blueKings++;
      } else {
        pieceVal = 1000; // Base pawn value
        if (isYellow) yellowPieces++; else bluePieces++;
        
        // Advancement bonus (reduced to avoid suicidal runs)
        if (isYellow) {
          pieceVal += r * 20; 
        } else {
          pieceVal += (7 - r) * 20;
        }

        // Promotion proximity bonus
        if (isYellow && r >= 5) pieceVal += 100;
        if (!isYellow && r <= 2) pieceVal += 100;
      }

      // Center control (important for mobility)
      if (r >= 2 && r <= 5 && c >= 2 && c <= 5) {
        pieceVal += 50;
      }

      // Back row protection (keeping pieces in the back row is good defense)
      if (isYellow && r === 1) pieceVal += 30;
      if (!isYellow && r === 6) pieceVal += 30;

      score += isYellow ? pieceVal : -pieceVal;
    }
  }

  // Material balance is paramount
  score += (yellowPieces - bluePieces) * 500;
  score += (yellowKings - blueKings) * 5000;

  // Mobility bonus: reward having more move options
  const yellowMoves = getValidMoves(board, 'yellow').length;
  const blueMoves = getValidMoves(board, 'blue').length;
  score += (yellowMoves - blueMoves) * 10;

  return score;
};

// Quiescence Search to avoid the horizon effect
const quiescence = (board: any[][], alpha: number, beta: number, isMaximizing: boolean): number => {
  const standPat = evaluateBoard(board);
  
  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    const moves = getValidMoves(board, 'yellow').filter(m => (m.captures?.length || 0) > 0);
    for (const move of moves) {
      const nextBoard = applyMove(board, move);
      const score = quiescence(nextBoard, alpha, beta, false);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  } else {
    if (standPat <= alpha) return alpha;
    if (beta > standPat) beta = standPat;

    const moves = getValidMoves(board, 'blue').filter(m => (m.captures?.length || 0) > 0);
    for (const move of moves) {
      const nextBoard = applyMove(board, move);
      const score = quiescence(nextBoard, alpha, beta, true);
      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
    return beta;
  }
};

const minimax = (
  board: any[][], 
  depth: number, 
  alpha: number, 
  beta: number, 
  isMaximizing: boolean
): { score: number, move: Move | null } => {
  const player: Player = isMaximizing ? 'yellow' : 'blue';
  const moves = getValidMoves(board, player);

  // Terminal state
  if (moves.length === 0) {
    return { score: isMaximizing ? -20000 : 20000, move: null };
  }

  // Depth reached: use Quiescence Search instead of raw evaluation
  if (depth === 0) {
    return { score: quiescence(board, alpha, beta, isMaximizing), move: null };
  }

  let bestMove: Move | null = null;

  if (isMaximizing) {
    let maxEval = -Infinity;
    // Move ordering: captures first
    const sortedMoves = [...moves].sort((a, b) => (b.captures?.length || 0) - (a.captures?.length || 0));
    
    for (const move of sortedMoves) {
      const nextBoard = applyMove(board, move);
      const ev = minimax(nextBoard, depth - 1, alpha, beta, false).score;
      
      if (ev > maxEval) {
        maxEval = ev;
        bestMove = move;
      }
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    const sortedMoves = [...moves].sort((a, b) => (b.captures?.length || 0) - (a.captures?.length || 0));

    for (const move of sortedMoves) {
      const nextBoard = applyMove(board, move);
      const ev = minimax(nextBoard, depth - 1, alpha, beta, true).score;
      
      if (ev < minEval) {
        minEval = ev;
        bestMove = move;
      }
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
};
