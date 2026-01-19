import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function StreakBadge({ currentStreak, longestStreak, compact = false }) {
  if (compact) {
    return (
      <motion.div
        animate={{ scale: currentStreak > 0 ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.5, repeat: currentStreak > 0 ? Infinity : 0, repeatDelay: 2 }}
        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full px-3 py-1.5 shadow-lg"
      >
        <Flame className="w-4 h-4" />
        <span className="font-bold">{currentStreak}</span>
      </motion.div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Tu racha de estudio
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="relative inline-block">
            <motion.div
              animate={{ 
                scale: currentStreak > 0 ? [1, 1.2, 1] : 1,
                rotate: currentStreak > 0 ? [0, -5, 5, 0] : 0
              }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="text-5xl mb-2"
            >
              🔥
            </motion.div>
            {currentStreak > 3 && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs"
              >
                ⚡
              </motion.div>
            )}
          </div>
          <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
          <p className="text-sm text-slate-500">Días seguidos</p>
        </div>

        <div className="text-center">
          <div className="text-5xl mb-2">🏆</div>
          <p className="text-3xl font-bold text-amber-600">{longestStreak}</p>
          <p className="text-sm text-slate-500">Récord</p>
        </div>
      </div>

      {currentStreak > 0 && (
        <div className="mt-4 bg-orange-50 rounded-xl p-3">
          <p className="text-xs text-orange-700 text-center">
            ¡Sigue así! Estudiar todos los días te hace más inteligente 🧠
          </p>
        </div>
      )}
    </div>
  );
}