
import { Piece, Player, Move } from '../types';
import { BOARD_SIZE } from '../constants';

export const createInitialBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

  // Turkish Dama setup:
  // Yellow (AI) on rows 1 and 2 (0-indexed)
  // Blue (Player) on rows 5 and 6 (0-indexed)
  // Note: Turkish Dama usually uses rows 2,3 and 6,7 in 1-indexing.
  // In 0-indexing: rows 1,2 and 5,6.
  
  for (let r = 1; r <= 2; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      board[r][c] = { id: `yellow-${r}-${c}`, player: 'yellow', type: 'pawn', row: r, col: c };
    }
  }

  for (let r = 5; r <= 6; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      board[r][c] = { id: `blue-${r}-${c}`, player: 'blue', type: 'pawn', row: r, col: c };
    }
  }

  return board;
};

export const getValidMoves = (board: (Piece | null)[][], player: Player): Move[] => {
  let allMoves: Move[] = [];
  let maxCaptures = 0;

  // First check for captures (mandatory)
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.player === player) {
        const captures = getPieceCaptures(board, piece);
        if (captures.length > 0) {
          const currentMax = Math.max(...captures.map(m => m.captures?.length || 0));
          if (currentMax > maxCaptures) {
            maxCaptures = currentMax;
            allMoves = captures.filter(m => (m.captures?.length || 0) === currentMax);
          } else if (currentMax === maxCaptures && maxCaptures > 0) {
            allMoves.push(...captures.filter(m => (m.captures?.length || 0) === currentMax));
          }
        }
      }
    }
  }

  // If no captures, check for regular moves
  if (maxCaptures === 0) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = board[r][c];
        if (piece && piece.player === player) {
          allMoves.push(...getPieceRegularMoves(board, piece));
        }
      }
    }
  }

  return allMoves;
};

const getPieceRegularMoves = (board: (Piece | null)[][], piece: Piece): Move[] => {
  const moves: Move[] = [];
  const { row, col, type, player } = piece;

  if (type === 'pawn') {
    const directions = player === 'blue' 
      ? [[-1, 0], [0, -1], [0, 1]] // Up, Left, Right
      : [[1, 0], [0, -1], [0, 1]];  // Down, Left, Right

    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !board[nr][nc]) {
        moves.push({ from: { row, col }, to: { row: nr, col: nc } });
      }
    }
  } else {
    // King moves
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dr, dc] of directions) {
      let nr = row + dr;
      let nc = col + dc;
      while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !board[nr][nc]) {
        moves.push({ from: { row, col }, to: { row: nr, col: nc } });
        nr += dr;
        nc += dc;
      }
    }
  }

  return moves;
};

const getPieceCaptures = (board: (Piece | null)[][], piece: Piece, visited: string[] = []): Move[] => {
  const captures: Move[] = [];
  const { row, col, type, player } = piece;

  if (type === 'pawn') {
    const directions = player === 'blue' 
      ? [[-1, 0], [0, -1], [0, 1]] // Up, Left, Right
      : [[1, 0], [0, -1], [0, 1]];  // Down, Left, Right

    for (const [dr, dc] of directions) {
      const midR = row + dr;
      const midC = col + dc;
      const endR = row + 2 * dr;
      const endC = col + 2 * dc;

      if (endR >= 0 && endR < BOARD_SIZE && endC >= 0 && endC < BOARD_SIZE) {
        const midPiece = board[midR][midC];
        if (midPiece && midPiece.player !== player && !visited.includes(`${midR}-${midC}`) && !board[endR][endC]) {
          const nextVisited = [...visited, `${midR}-${midC}`];
          
          // Check if this move promotes the pawn to Dama
          const isPromoted = (player === 'blue' && endR === 0) || (player === 'yellow' && endR === BOARD_SIZE - 1);
          
          if (isPromoted) {
            // Jump sequence ends upon promotion
            captures.push({
              from: { row, col },
              to: { row: endR, col: endC },
              path: [{ row: endR, col: endC }],
              captures: [{ row: midR, col: midC }]
            });
          } else {
            const nextPiece = { ...piece, row: endR, col: endC };
            const virtualBoard = board.map(r => [...r]);
            virtualBoard[row][col] = null;
            virtualBoard[midR][midC] = null;
            virtualBoard[endR][endC] = nextPiece;

            const chain = getPieceCaptures(virtualBoard, nextPiece, nextVisited);
            if (chain.length > 0) {
              for (const c of chain) {
                captures.push({
                  from: { row, col },
                  to: c.to,
                  path: [{ row: endR, col: endC }, ...(c.path || [])],
                  captures: [{ row: midR, col: midC }, ...(c.captures || [])]
                });
              }
            } else {
              captures.push({
                from: { row, col },
                to: { row: endR, col: endC },
                path: [{ row: endR, col: endC }],
                captures: [{ row: midR, col: midC }]
              });
            }
          }
        }
      }
    }
  } else {
    // King captures
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dr, dc] of directions) {
      let midR = row + dr;
      let midC = col + dc;
      
      // Find the first piece in this direction
      while (midR >= 0 && midR < BOARD_SIZE && midC >= 0 && midC < BOARD_SIZE && !board[midR][midC]) {
        midR += dr;
        midC += dc;
      }

      if (midR >= 0 && midR < BOARD_SIZE && midC >= 0 && midC < BOARD_SIZE) {
        const midPiece = board[midR][midC];
        if (midPiece && midPiece.player !== player && !visited.includes(`${midR}-${midC}`)) {
          let endR = midR + dr;
          let endC = midC + dc;
          
          // King can land on any square after the captured piece
          while (endR >= 0 && endR < BOARD_SIZE && endC >= 0 && endC < BOARD_SIZE && !board[endR][endC]) {
            const nextVisited = [...visited, `${midR}-${midC}`];
            const nextPiece = { ...piece, row: endR, col: endC };
            
            const virtualBoard = board.map(r => [...r]);
            virtualBoard[row][col] = null;
            virtualBoard[midR][midC] = null;
            virtualBoard[endR][endC] = nextPiece;

            const chain = getPieceCaptures(virtualBoard, nextPiece, nextVisited);
            if (chain.length > 0) {
              for (const c of chain) {
                captures.push({
                  from: { row, col },
                  to: c.to,
                  path: [{ row: endR, col: endC }, ...(c.path || [])],
                  captures: [{ row: midR, col: midC }, ...(c.captures || [])]
                });
              }
            } else {
              captures.push({
                from: { row, col },
                to: { row: endR, col: endC },
                path: [{ row: endR, col: endC }],
                captures: [{ row: midR, col: midC }]
              });
            }
            endR += dr;
            endC += dc;
          }
        }
      }
    }
  }

  return captures;
};

export const applyMove = (board: (Piece | null)[][], move: Move): (Piece | null)[][] => {
  const newBoard = board.map(r => [...r]);
  const piece = newBoard[move.from.row][move.from.col];
  
  if (!piece) return newBoard;

  newBoard[move.from.row][move.from.col] = null;
  
  // Remove captured pieces
  if (move.captures) {
    for (const cap of move.captures) {
      newBoard[cap.row][cap.col] = null;
    }
  }

  // Check for king promotion
  let type = piece.type;
  if (piece.player === 'blue' && move.to.row === 0) type = 'king';
  if (piece.player === 'yellow' && move.to.row === BOARD_SIZE - 1) type = 'king';

  newBoard[move.to.row][move.to.col] = {
    ...piece,
    row: move.to.row,
    col: move.to.col,
    type
  };

  return newBoard;
};
