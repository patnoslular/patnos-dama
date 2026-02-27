import React, { useState, useEffect } from 'react';

const BOARD_SIZE = 8;
type Player = 'white' | 'black';
type Piece = { player: Player; isDama: boolean; id: number };
type Board = (Piece | null)[][];

const App: React.FC = () => {
  const [board, setBoard] = useState<Board>([]);
  const [turn, setTurn] = useState<Player>('white');
  const [selected, setSelected] = useState<[number, number] | null>(null);

  useEffect(() => { initBoard(); }, []);

  const initBoard = () => {
    const newBoard: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    let idCounter = 0;
    for (let r = 1; r < 3; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) newBoard[r][c] = { player: 'black', isDama: false, id: idCounter++ };
    }
    for (let r = 5; r < 7; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) newBoard[r][c] = { player: 'white', isDama: false, id: idCounter++ };
    }
    setBoard(newBoard);
    setTurn('white');
  };

  const handleSquareClick = (r: number, c: number) => {
    const piece = board[r][c];
    if (piece && piece.player === turn) {
      setSelected([r, c]);
      return;
    }
    if (selected) {
      const [sr, sc] = selected;
      if (isValidMove(sr, sc, r, c)) {
        executeMove(sr, sc, r, c);
      }
    }
  };

  const isValidMove = (sr: number, sc: number, tr: number, tc: number) => {
    if (board[tr][tc] !== null) return false;
    const piece = board[sr][sc];
    if (!piece) return false;
    const rowDiff = tr - sr;
    const colDiff = tc - sc;

    if (piece.isDama) {
      if (sr !== tr && sc !== tc) return false;
      const rStep = sr === tr ? 0 : (tr - sr) / Math.abs(tr - sr);
      const cStep = sc === tc ? 0 : (tc - sc) / Math.abs(tc - sc);
      let piecesInBetween = 0;
      let currR = sr + rStep; let currC = sc + cStep;
      while (currR !== tr || currC !== tc) {
        if (board[currR][currC]) {
          if (board[currR][currC]?.player === piece.player) return false;
          piecesInBetween++;
        }
        currR += rStep; currC += cStep;
      }
      return piecesInBetween <= 1;
    } else {
      const forward = piece.player === 'white' ? -1 : 1;
      if (Math.abs(colDiff) + Math.abs(rowDiff) === 1) return rowDiff === forward || (Math.abs(colDiff) === 1 && rowDiff === 0);
      if ((Math.abs(rowDiff) === 2 && colDiff === 0 && rowDiff === 2 * forward) || (Math.abs(colDiff) === 2 && rowDiff === 0)) {
        const midR = sr + rowDiff / 2; const midC = sc + colDiff / 2;
        return board[midR][midC] !== null && board[midR][midC]?.player !== piece.player;
      }
    }
    return false;
  };

  const executeMove = (sr: number, sc: number, tr: number, tc: number) => {
    const newBoard = board.map(row => [...row]);
    const piece = { ...newBoard[sr][sc]! };
    const rowDiff = tr - sr; const colDiff = tc - sc;

    if (Math.abs(rowDiff) >= 2 || Math.abs(colDiff) >= 2) {
      const rStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
      const cStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
      let currR = sr + rStep; let currC = sc + cStep;
      while (currR !== tr || currC !== tc) {
        if (newBoard[currR][currC]) newBoard[currR][currC] = null;
        currR += rStep; currC += cStep;
      }
    }
    if ((piece.player === 'white' && tr === 0) || (piece.player === 'black' && tr === BOARD_SIZE - 1)) piece.isDama = true;
    newBoard[tr][tc] = piece;
    newBoard[sr][sc] = null;
    setBoard(newBoard);
    setSelected(null);
    setTurn(turn === 'white' ? 'black' : 'white');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a', margin: 0 }}>
      <h2 style={{ color: 'white', fontFamily: 'sans-serif' }}>Sıra: {turn === 'white' ? 'Beyaz' : 'Siyah'}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, width: 'min(95vw, 400px)', height: 'min(95vw, 400px)', border: '4px solid #333' }}>
        {board.map((row, r) => row.map((piece, c) => (
          <div key={`${r}-${c}`} onClick={() => handleSquareClick(r, c)} style={{ backgroundColor: (r + c) % 2 === 0 ? '#f0d9b5' : '#b58863', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {piece && (
              <div style={{
                width: '80%', height: '80%', borderRadius: '50%',
                backgroundColor: piece.player === 'white' ? '#fff' : '#000',
                border: selected?.[0] === r && selected?.[1] === c ? '4px solid #3498db' : '2px solid #555',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: piece.player === 'white' ? '#000' : '#fff', fontWeight: 'bold'
              }}>{piece.isDama ? 'D' : ''}</div>
            )}
          </div>
        )))}
      </div>
      <button onClick={initBoard} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Yeni Oyun</button>
    </div>
  );
};
export default App;
