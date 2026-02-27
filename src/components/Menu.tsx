
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TRANSLATIONS } from '../constants';
import { Language, Difficulty } from '../types';
import { Trophy, Play, BookOpen, Settings2 } from 'lucide-react';

interface MenuProps {
  onStart: (name: string, difficulty: Difficulty, lang: Language) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Menu: React.FC<MenuProps> = ({ onStart, language, setLanguage }) => {
  const [name, setName] = React.useState('');
  const [difficulty, setDifficulty] = React.useState<Difficulty>('medium');
  const [showRules, setShowRules] = React.useState(false);

  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#121212] p-8 rounded-[40px] shadow-2xl w-full max-w-md border border-white/10"
      >
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-2 mb-2">
              <img 
                src="https://static.wixstatic.com/media/7e2174_63be697a3dd64d06b050165599965a9a~mv2.png" 
                alt="Patnos Logo" 
                className="w-16 h-16 object-contain"
                referrerPolicy="no-referrer"
              />
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest text-left">
                İzmir Patnoslular<br/>Derneği Yapımıdır
              </p>
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic flex gap-1">
              <span className="text-[#3B82F6]">PATNOS</span>
              <span className="text-white">DAMA</span>
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Language Switcher */}
          <div className="flex justify-center gap-2 mb-4">
            <button 
              onClick={() => setLanguage('tr')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${language === 'tr' ? 'bg-[#3B82F6] text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              Türkçe
            </button>
            <button 
              onClick={() => setLanguage('ku')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${language === 'ku' ? 'bg-[#3B82F6] text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              Kurdî
            </button>
          </div>

          {/* Name Input */}
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full px-6 py-4 bg-white/5 border-2 border-white/5 rounded-2xl focus:border-[#3B82F6] focus:ring-0 transition-all outline-none font-semibold text-white placeholder:text-white/20"
            />
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              {t.difficulty}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`
                    py-3 rounded-xl text-sm font-bold transition-all
                    ${difficulty === d 
                      ? 'bg-white text-black shadow-md' 
                      : 'bg-white/5 text-white/40 hover:bg-white/10'}
                  `}
                >
                  {t[d]}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={() => onStart(name || 'Player', difficulty, language)}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Play className="w-6 h-6 fill-current" />
              {t.start}
            </button>
            
            <button
              onClick={() => setShowRules(true)}
              className="w-full bg-white/5 hover:bg-white/10 text-white/60 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3"
            >
              <BookOpen className="w-5 h-5" />
              {t.rules}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRules(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-3xl max-w-lg w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-black text-stone-900 mb-6 flex items-center gap-3">
                <BookOpen className="text-blue-600" />
                {t.rulesTitle}
              </h2>
              <ul className="space-y-4 text-stone-600 font-medium">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  {t.rule1}
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  {t.rule2}
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  {t.rule3}
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  {t.rule4}
                </li>
              </ul>
              <button
                onClick={() => setShowRules(false)}
                className="mt-8 w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all"
              >
                Anladım / Fêm kir
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
