import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target } from 'lucide-react';

export default function ClassroomProgress({ classroom }) {
  const progress = Math.min(100, Math.round(((classroom.current_tokens || 0) / (classroom.token_goal || 10000)) * 100));
  const remaining = Math.max(0, (classroom.token_goal || 10000) - (classroom.current_tokens || 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-5 text-white shadow-xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5" />
        <span className="font-bold">{classroom.name}</span>
        <span className="text-purple-200 text-sm">· {classroom.school}</span>
      </div>

      {classroom.goal_reward && (
        <div className="bg-white/20 rounded-2xl px-4 py-2 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" />
          <span className="text-sm font-semibold">🎯 {classroom.goal_reward}</span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{(classroom.current_tokens || 0).toLocaleString()} SofiaCoins</span>
          <span>Meta: {(classroom.token_goal || 10000).toLocaleString()}</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full"
          />
        </div>
        <div className="flex justify-between text-xs text-purple-200">
          <span>{progress}% completado</span>
          <span>Faltan {remaining.toLocaleString()} 🪙</span>
        </div>
      </div>

      {classroom.goal_reached && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-3 bg-yellow-400 text-yellow-900 rounded-2xl p-3 text-center font-bold"
        >
          🎉 ¡META ALCANZADA! Habla con tu maestro para reclamar la recompensa
        </motion.div>
      )}
    </motion.div>
  );
}