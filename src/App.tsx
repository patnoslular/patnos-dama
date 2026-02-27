import React, { useState, useEffect, useCallback } from 'react';
import Confetti from 'react-confetti';

// Ses Efektleri
const moveSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
const captureSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');

const BOARD_SIZE = 8;

type Player = 'white' | 'black';
type Piece = { player: Player; isDama: boolean; id: number };
type Board = (Piece | null)[][];

const App: React.FC = () => {
  const [board, setBoard] = useState<Board>([]);
  const [turn, setTurn] = useState<Player>('white');
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    initBoard();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initBoard = () => {
    const newBoard: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    let idCounter = 0;
    for (let r = 1; r < 3; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        newBoard[r][c] = { player: 'black', isDama: false, id: idCounter++ };
      }
    }
    for (let r = 5; r < 7; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        newBoard[r][c] = { player: 'white', isDama: false, id: idCounter++ };
      }
    }
    setBoard(newBoard);
    setWinner(null);
    setTurn('white');
    setLastMove(null);
  };

  const playSound = (type: 'move' | 'capture') => {
    const sound = type === 'move' ? moveSound : captureSound;
    sound.currentTime = 0;
    sound.play().catch(() => {}); // Tarayıcı engellemesine karşı
  };

  const handleSquareClick = (r: number, c: number) => {
    if (winner) return;

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
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    if (piece.isDama) {
      if (sr !== tr && sc !== tc) return false;
      const rStep = sr === tr ? 0 : rowDiff / absRowDiff;
      const cStep = sc === tc ? 0 : colDiff / absColDiff;
      let piecesInBetween = 0;
      let currR = sr + rStep;
      let currC = sc + cStep;
      while (currR !== tr || currC !== tc) {
        if (board[currR][currC]) {
          if (board[currR][currC]?.player === piece.player) return false;
          piecesInBetween++;
        }
        currR += rStep;
        currC += cStep;
      }
      return piecesInBetween <= 1;
    } else {
      const forward = piece.player === 'white' ? -1 : 1;
      if (absColDiff + absRowDiff === 1) {
        return rowDiff === forward || absColDiff === 1 && rowDiff === 0;
      }
      if ((absRowDiff === 2 && absColDiff === 0 && rowDiff === 2 * forward) || (absColDiff === 2 && absRowDiff === 0)) {
        const midR = sr + rowDiff / 2;
        const midC = sc + colDiff / 2;
        return board[midR][midC] !== null && board[midR][midC]?.player !== piece.player;
      }
    }
    return false;
  };

  const executeMove = (sr: number, sc: number, tr: number, tc: number) => {
    const newBoard = board.map(row => [...row]);
    const piece = { ...newBoard[sr][sc]! };
    let captured = false;

    const rowDiff = tr - sr;
    const colDiff = tc - sc;

    if (Math.abs(rowDiff) >= 2 || Math.abs(colDiff) >= 2) {
      const rStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
      const cStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
      let currR = sr + rStep;
      let currC = sc + cStep;
      while (currR !== tr || currC !== tc) {
        if (newBoard[currR][currC]) {
          newBoard[currR][currC] = null;
          captured = true;
        }
        currR += rStep;
        currC += cStep;
      }
    }

    if ((piece.player === 'white' && tr === 0) || (piece.player === 'black' && tr === BOARD_SIZE - 1)) {
      piece.isDama = true;
    }

    newBoard[tr][tc] = piece;
    newBoard[sr][sc] = null;

    setBoard(newBoard);
    setLastMove([tr, tc]);
    setSelected(null);
    setTurn(turn === 'white' ? 'black' : 'white');
    playSound(captured ? 'capture' : 'move');
    checkWinner(newBoard);
  };

  const checkWinner = (currentBoard: Board) => {
    const counts = { white: 0, black: 0 };
    currentBoard.forEach(row => row.forEach(p => { if (p) counts[p.player]++; }));
    if (counts.white === 0) setWinner('black');
    else if (counts.black === 0) setWinner('white');
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a', fontFamily: 'Arial'
    }}>
      {winner && <Confetti width={windowSize.width} height={windowSize.height} />}
      
      <h2 style={{ color: 'white', marginBottom: '10px' }}>
        {winner ? `Tebrikler! ${winner === 'white' ? 'Beyaz' : 'Siyah'} Kazandı!` : `Sıra: ${turn === 'white' ? 'Beyaz' : 'Siyah'}`}
      </h2>

      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
        width: 'min(90vw, 400px)', height: 'min(90vw, 400px)', border: '4px solid #333'
      }}>
        {board.map((row, r) => row.map((piece, c) => {
          const isSelected = selected?.[0] === r && selected?.[1] === c;
          const isLastMove = lastMove?.[0] === r && lastMove?.[1] === c;
          
          return (
            <div
              key={`${r}-${c}`}
              onClick={() => handleSquareClick(r, c)}
              style={{
                backgroundColor: (r + c) % 2 === 0 ? '#f0d9b5' : '#b58863',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative'
              }}
            >
              {piece && (
                <div style={{
                  width: '80%', height: '80%', borderRadius: '50%',
                  backgroundColor: piece.player === 'white' ? '#fff' : '#000',
                  border: isSelected ? '4px solid #3498db' : '2px solid #555',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: piece.player === 'white' ? '#000' : '#fff',
                  fontSize: '20px', fontWeight: 'bold',
                  animation: isLastMove ? 'blink 0.5s step-end 3' : 'none',
                  // Pürüzsüz hareket için transition kaldırıldı, anlık tepki veriyor
                }}>
                  {piece.isDama ? 'D' : ''}
                </div>
              )}
              <style>{`
                @keyframes blink { 
                  50% { opacity: 0.3; transform: scale(1.1); } 
                }
              `}</style>
            </div>
          );
        }))}
      </div>

      <button onClick={initBoard} style={{
        marginTop: '20px', padding: '10px 20px', fontSize: '16px',
        backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
      }}>
        Yeni Oyun
      </button>
    </div>
  );
};

export default App;
