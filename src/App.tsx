/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, Player, Difficulty, Language, Move } from './types';
import { TRANSLATIONS, BOARD_SIZE } from './constants';
import { createInitialBoard, getValidMoves, applyMove } from './logic/damaLogic';
import { getAIMove } from './logic/aiLogic';
import { Board } from './components/Board';
import { Menu } from './components/Menu';
import { Timer, User, Cpu, RotateCcw, ChevronLeft, Trophy } from 'lucide-react';

const PLAYER_TIME_LIMIT = 120;

export default function App() {
  const [state, setState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: 'blue',
    winner: null,
    status: 'menu',
    playerName: '',
    difficulty: 'medium',
    language: 'tr',
    timeLeft: PLAYER_TIME_LIMIT,
    lastMove: null,
    history: [],
  });

  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (state.status === 'playing' && !state.winner) {
      setValidMoves(getValidMoves(state.board, state.currentPlayer));
    }
  }, [state.board, state.currentPlayer, state.status, state.winner]);

  const t = TRANSLATIONS[state.language];

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (state.status === 'playing' && !state.winner && state.currentPlayer === 'blue') {
      interval = setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 1) {
            return { ...prev, winner: 'yellow' }; // Time out
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.status, state.winner, state.currentPlayer]);

  // AI Turn Logic
  useEffect(() => {
    if (state.status === 'playing' && state.currentPlayer === 'yellow' && !state.winner && !isAnimating) {
      const aiMove = getAIMove(state);
      if (aiMove) {
        // AI moves "instantly" as requested, but a small delay for visual feedback is better
        const timer = setTimeout(() => {
          handleMove(aiMove);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        setState(prev => ({ ...prev, winner: 'blue' }));
      }
    }
  }, [state.currentPlayer, state.status, state.winner, isAnimating]);

  const handleStart = (name: string, difficulty: Difficulty, lang: Language) => {
    setState({
      ...state,
      status: 'playing',
      playerName: name,
      difficulty,
      language: lang,
      board: createInitialBoard(),
      currentPlayer: 'blue',
      winner: null,
      timeLeft: PLAYER_TIME_LIMIT,
      lastMove: null,
      history: [],
    });
  };

  const handleMove = async (move: Move) => {
    setIsAnimating(true);
    
    let currentBoard = state.board;
    const piece = currentBoard[move.from.row][move.from.col];
    if (!piece) {
      setIsAnimating(false);
      return;
    }

    // If it's a capture move with a path
    if (move.captures && move.path) {
      let tempBoard = currentBoard.map(r => [...r]);
      let currentPos = move.from;

      for (let i = 0; i < move.captures.length; i++) {
        const capturePos = move.captures[i];
        const landingPos = move.path[i];

        // 1. Move piece to landing position
        const movingPiece = tempBoard[currentPos.row][currentPos.col];
        tempBoard[currentPos.row][currentPos.col] = null;
        
        // Check for king promotion at each step
        let type = movingPiece!.type;
        if (movingPiece!.player === 'blue' && landingPos.row === 0) type = 'king';
        if (movingPiece!.player === 'yellow' && landingPos.row === BOARD_SIZE - 1) type = 'king';

        tempBoard[landingPos.row][landingPos.col] = {
          ...movingPiece!,
          row: landingPos.row,
          col: landingPos.col,
          type
        };

        // 2. Remove captured piece
        tempBoard[capturePos.row][capturePos.col] = null;

        // 3. Update state for visual feedback
        setState(prev => ({ ...prev, board: tempBoard, lastMove: { from: currentPos, to: landingPos } }));
        
        currentPos = landingPos;
        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      currentBoard = tempBoard;
    } else {
      // Regular move
      currentBoard = applyMove(state.board, move);
      setState(prev => ({ ...prev, board: currentBoard, lastMove: move }));
    }

    const nextPlayer = state.currentPlayer === 'blue' ? 'yellow' : 'blue';
    const nextMoves = getValidMoves(currentBoard, nextPlayer);
    
    // Repetition check
    const boardHash = currentBoard.map(row => row.map(p => p ? `${p.player}-${p.type}` : 'empty').join(',')).join('|');
    const newHistory = [...state.history, boardHash];
    const repetitions = newHistory.filter(h => h === boardHash).length;

    setState(prev => ({
      ...prev,
      currentPlayer: nextPlayer,
      timeLeft: PLAYER_TIME_LIMIT,
      history: newHistory,
      winner: repetitions >= 3 ? 'draw' : (nextMoves.length === 0 ? prev.currentPlayer : null),
    }));

    setIsAnimating(false);
  };

  if (state.status === 'menu') {
    return (
      <Menu 
        onStart={handleStart} 
        language={state.language} 
        setLanguage={(lang) => setState(prev => ({ ...prev, language: lang }))} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans text-white">
      {/* Header */}
      <header className="bg-[#121212] border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <button 
          onClick={() => setState(prev => ({ ...prev, status: 'menu' }))}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <img 
            src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" 
            alt="Logo" 
            className="w-10 h-10 object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter italic leading-none flex gap-1">
              <span className="text-[#3B82F6]">PATNOS</span>
              <span className="text-white">DAMA</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-[1px] w-3 bg-white/20" />
              <span className="text-[9px] font-black text-[#3B82F6] uppercase tracking-[0.2em]">
                {t[state.difficulty]}
              </span>
              <div className="h-[1px] w-3 bg-white/20" />
            </div>
          </div>
        </div>
        <button 
          onClick={() => handleStart(state.playerName, state.difficulty, state.language)}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <RotateCcw className="w-5 h-5 text-white/40" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 gap-4 sm:gap-6 max-w-2xl mx-auto w-full">
        
        {/* Players Info */}
        <div className="w-full grid grid-cols-2 gap-4">
          {/* Player */}
          <div className={`
            p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3
            ${state.currentPlayer === 'blue' ? 'bg-[#121212] border-[#3B82F6] shadow-lg scale-105' : 'bg-white/5 border-transparent opacity-40'}
          `}>
            <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white/40 uppercase truncate">{t.playerLabel}</p>
              <div className="flex items-center gap-1 text-[#3B82F6] font-black">
                <Timer className="w-4 h-4" />
                <span className={state.timeLeft < 20 ? 'text-red-500 animate-pulse' : ''}>
                  {state.timeLeft}s
                </span>
              </div>
            </div>
          </div>

          {/* AI */}
          <div className={`
            p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3
            ${state.currentPlayer === 'yellow' ? 'bg-[#121212] border-[#FACC15] shadow-lg scale-105' : 'bg-white/5 border-transparent opacity-40'}
          `}>
            <div className="w-10 h-10 rounded-full bg-[#FACC15] flex items-center justify-center text-white">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white/40 uppercase truncate">Patnos Dama</p>
              <p className="text-sm font-black text-[#FACC15]">
                {state.currentPlayer === 'yellow' ? t.thinking : t.waiting}
              </p>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <Board 
          board={state.board}
          onMove={handleMove}
          validMoves={validMoves}
          lastMove={state.lastMove}
          currentPlayer={state.currentPlayer}
          isAnimating={isAnimating}
        />

        {/* Status Bar */}
        <div className="w-full bg-[#121212] p-4 rounded-2xl shadow-sm border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${state.currentPlayer === 'blue' ? 'bg-[#3B82F6]' : 'bg-[#FACC15]'} animate-pulse`} />
            <span className="font-bold text-white/60">{t.turn} {state.currentPlayer === 'blue' ? t.blue : t.yellow}</span>
          </div>
          <div className="text-xs font-bold text-white/30 uppercase">
            {state.difficulty} Mode
          </div>
        </div>
      </main>

      {/* Winner Modal */}
      <AnimatePresence>
        {state.winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-[40px] shadow-2xl text-center max-w-sm w-full"
            >
              <div className="mb-6 inline-flex flex-col items-center">
                <img 
                  src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" 
                  alt="Patnos Logo" 
                  className="w-32 h-32 object-contain mb-4"
                  referrerPolicy="no-referrer"
                />
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  İzmir Patnoslular Derneği Yapımıdır
                </p>
              </div>
              <h2 className="text-3xl font-black text-stone-900 mb-2">{t.winner}</h2>
              <p className={`text-2xl font-black mb-8 ${state.winner === 'blue' ? 'text-blue-600' : 'text-yellow-600'}`}>
                {state.winner === 'blue' ? state.playerName : 'Patnos Dama'}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleStart(state.playerName, state.difficulty, state.language)}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  {t.playAgain}
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, status: 'menu' }))}
                  className="w-full bg-stone-100 text-stone-600 py-4 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                >
                  {t.backToMenu}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
