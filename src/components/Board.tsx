
import React from 'react';
import { motion, AnimatePresence, motionValue } from 'motion/react';
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
            <PieceComponent 
              key={piece?.id || `empty-${r}-${c}`}
              piece={piece}
              r={r}
              c={c}
              last={last}
              currentPlayer={currentPlayer}
              isAnimating={isAnimating}
              validMoves={validMoves}
              onMove={onMove}
              containerRef={containerRef}
            />
          );
        })}
      </div>
    </div>
  );
};

interface PieceComponentProps {
  piece: Piece | null;
  r: number;
  c: number;
  last: boolean;
  currentPlayer: Player;
  isAnimating: boolean;
  validMoves: Move[];
  onMove: (move: Move) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const PieceComponent: React.FC<PieceComponentProps> = ({ 
  piece, r, c, last, currentPlayer, isAnimating, validMoves, onMove, containerRef 
}) => {
  const x = motionValue(0);
  const y = motionValue(0);

  if (!piece) {
    return (
      <div className={`relative flex items-center justify-center ${(r + c) % 2 === 0 ? 'bg-[#D6D6D6]' : 'bg-[#1A1A1A]'}`}>
        {last && <div className="absolute inset-0 bg-blue-400/20" />}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${(r + c) % 2 === 0 ? 'bg-[#D6D6D6]' : 'bg-[#1A1A1A]'}`}>
      {last && <div className="absolute inset-0 bg-blue-400/20" />}
      <motion.div
        style={{ x, y }}
        drag={piece.player === 'blue' && currentPlayer === 'blue' && !isAnimating}
        dragConstraints={containerRef}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (!containerRef.current) return;
          const gridRect = containerRef.current.firstElementChild?.getBoundingClientRect();
          if (!gridRect) return;
          
          const targetC = Math.floor((info.point.x - gridRect.left) / (gridRect.width / 8));
          const targetR = Math.floor((info.point.y - gridRect.top) / (gridRect.height / 8));
          
          const move = validMoves.find(m => 
            m.from.row === r && 
            m.from.col === c && 
            m.to.row === targetR && 
            m.to.col === targetC
          );
          
          if (move) {
            onMove(move);
          }
          
          x.set(0);
          y.set(0);
        }}
        className={`
          relative w-[85%] h-[85%] rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.5)] flex items-center justify-center z-10
          ${piece.player === 'blue' 
            ? 'bg-[#2563EB] border-b-4 border-[#1E40AF] cursor-grab active:cursor-grabbing' 
            : 'bg-[#FACC15] border-b-4 border-[#CA8A04]'}
        `}
      >
        <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-[80%] h-[80%] rounded-full border border-black/20" />
          <div className="absolute w-[60%] h-[60%] rounded-full border border-black/20" />
          <div className="absolute w-[40%] h-[40%] rounded-full border border-black/20" />
          <div className="absolute w-[20%] h-[20%] rounded-full border border-black/20" />
        </div>
        
        {piece.type === 'king' && (
          <div className="text-white drop-shadow-md z-10 pointer-events-none">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
            </svg>
          </div>
        )}
      </motion.div>
    </div>
  );
};
