
import React from 'react';
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
  const isLastMove = (r: number, c: number) => 
    (lastMove?.from.row === r && lastMove?.from.col === c) || 
    (lastMove?.to.row === r && lastMove?.to.col === c);

  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative w-full aspect-square max-w-[500px] mx-auto bg-[#2A2A2A] p-2 sm:p-4 rounded-[30px] sm:rounded-[40px] shadow-2xl border-[6px] sm:border-[12px] border-[#2A2A2A]">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full overflow-hidden rounded-lg">
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => {
          const r = Math.floor(i / BOARD_SIZE);
          const c = i % BOARD_SIZE;
          const piece = board[r][c];
          const last = isLastMove(r, c);

          return (
            <div
              key={`${r}-${c}`}
              className={`
                relative flex items-center justify-center
                ${(r + c) % 2 === 0 ? 'bg-[#D6D6D6]' : 'bg-[#1A1A1A]'}
              `}
            >
              {/* Last move indicator */}
              {last && <div className="absolute inset-0 bg-blue-400/20" />}
              
              <AnimatePresence>
                {piece && (
                  <motion.div
                    layoutId={piece.id}
                    drag={piece.player === 'blue' && currentPlayer === 'blue' && !isAnimating}
                    dragSnapToOrigin
                    dragElastic={0.1}
                    onDragEnd={(_, info) => {
                      if (!containerRef.current) return;
                      const rect = containerRef.current.getBoundingClientRect();
                      const squareSize = (rect.width - 32) / 8; // 32 is padding (4*2 + 12*2 is wrong, it's p-4 which is 16px each side)
                      // Actually rect.width includes padding. The grid is inside p-4.
                      // Let's calculate based on the grid container.
                      const gridRect = containerRef.current.firstElementChild?.getBoundingClientRect();
                      if (!gridRect) return;
                      
                      const x = info.point.x - gridRect.left;
                      const y = info.point.y - gridRect.top;
                      
                      const targetC = Math.floor(x / (gridRect.width / 8));
                      const targetR = Math.floor(y / (gridRect.height / 8));
                      
                      const move = validMoves.find(m => 
                        m.from.row === r && 
                        m.from.col === c && 
                        m.to.row === targetR && 
                        m.to.col === targetC
                      );
                      
                      if (move) {
                        onMove(move);
                      }
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`
                      relative w-[85%] h-[85%] rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.5)] flex items-center justify-center z-10
                      ${piece.player === 'blue' 
                        ? 'bg-[#2563EB] border-b-4 border-[#1E40AF] cursor-grab' 
                        : 'bg-[#FACC15] border-b-4 border-[#CA8A04]'}
                    `}
                  >
                    {/* Concentric rings texture */}
                    <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-30 pointer-events-none">
                      <div className="w-[80%] h-[80%] rounded-full border border-black/20" />
                      <div className="absolute w-[60%] h-[60%] rounded-full border border-black/20" />
                      <div className="absolute w-[40%] h-[40%] rounded-full border border-black/20" />
                      <div className="absolute w-[20%] h-[20%] rounded-full border border-black/20" />
                    </div>
                    
                    {/* King Crown */}
                    {piece.type === 'king' && (
                      <motion.div 
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 0 }}
                        className="text-white drop-shadow-md z-10 pointer-events-none"
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                          <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
                        </svg>
                      </motion.div>
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
