import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Piece, Player, Move } from '../types';
import { BOARD_SIZE } from '../constants';

interface BoardProps {
  board: (Piece | null)[][];
  onMove: (move: Move) => void;
  validMoves: Move[];
  lastMove: Move | null;
  currentPlayer: Player;
  isAnimating: boolean;
}

export const Board: React.FC<BoardProps> = ({ board, onMove, validMoves, lastMove, currentPlayer, isAnimating }) => {
  const [selectedPos, setSelectedPos] = useState<{r: number, c: number} | null>(null);

  const isLastMove = (r: number, c: number) => 
    (lastMove?.from.row === r && lastMove?.from.col === c) || 
    (lastMove?.to.row === r && lastMove?.to.col === c);

  const handleSquareClick = (r: number, c: number) => {
    if (isAnimating) return;

    const piece = board[r][c];

    // 1. Kendi taşımızı seçme
    if (piece && piece.player === currentPlayer) {
      setSelectedPos({ r, c });
      return;
    }

    // 2. Seçili taş varken hedef kareye tıklama
    if (selectedPos) {
      const move = validMoves.find(m => 
        m.from.row === selectedPos.r && 
        m.from.col === selectedPos.c && 
        m.to.row === r && 
        m.to.col === c
      );

      if (move) {
        onMove(move);
        setSelectedPos(null);
      } else {
        // Geçersiz bir yere tıklandıysa seçimi kaldır
        setSelectedPos(null);
      }
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-[#2A2A2A] p-2 sm:p-4 rounded-[30px] sm:rounded-[40px] shadow-2xl border-[6px] sm:border-[12px] border-[#2A2A2A]">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full overflow-hidden rounded-lg">
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => {
          const r = Math.floor(i / BOARD_SIZE);
          const c = i % BOARD_SIZE;
          const piece = board[r][c];
          const isSelected = selectedPos?.r === r && selectedPos?.c === c;
          const isTarget = validMoves.some(m => selectedPos?.r === m.from.row && selectedPos?.c === m.from.col && m.to.row === r && m.to.col === c);
          const last = isLastMove(r, c);

          return (
            <div 
              key={`cell-${r}-${c}`}
              onClick={() => handleSquareClick(r, c)}
              className={`relative flex items-center justify-center cursor-pointer ${(r + c) % 2 === 0 ? 'bg-[#D6D6D6]' : 'bg-[#1A1A1A]'}`}
            >
              {last && <div className="absolute inset-0 bg-blue-400/10" />}
              
              {/* Gidebileceği yerleri gösteren küçük nokta */}
              {isTarget && (
                <div className="absolute w-4 h-4 rounded-full bg-blue-500/40 z-20 animate-pulse" />
              )}

              <AnimatePresence>
                {piece && (
                  <motion.div
                    layoutId={`piece-${piece.id}`}
                    initial={false}
                    animate={{ 
                      scale: isSelected ? 1.15 : 1,
                      y: isSelected ? -5 : 0
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`
                      relative w-[85%] h-[85%] rounded-full shadow-lg flex items-center justify-center z-10
                      ${piece.player === 'blue' 
                        ? 'bg-[#2563EB] border-b-4 border-[#1E40AF]' 
                        : 'bg-[#FACC15] border-b-4 border-[#CA8A04]'}
                      ${isSelected ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-transparent' : ''}
                    `}
                  >
                    <div className="absolute inset-0 rounded-full opacity-30 pointer-events-none">
                      <div className="w-full h-full rounded-full border border-black/10" />
                    </div>
                    
                    {piece.type === 'king' && (
                      <div className="text-white drop-shadow-md z-10">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                          <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
