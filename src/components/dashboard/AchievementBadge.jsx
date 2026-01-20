import React from 'react';
import { motion } from 'framer-motion';

const sizeClasses = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-20 h-20 text-4xl'
};

const achievements = {
  first_login: {
    emoji: '🌟',
    label: 'Primera vez',
    description: '¡Bienvenido a Sofia!',
    color: 'from-yellow-400 to-amber-500'
  },
  five_sessions: {
    emoji: '🔥',
    label: 'En racha',
    description: '5 sesiones completadas',
    color: 'from-orange-400 to-red-500'
  },
  math_master: {
    emoji: '🧮',
    label: 'Matemático',
    description: '10 problemas resueltos',
    color: 'from-blue-400 to-indigo-500'
  },
  creative_mind: {
    emoji: '🎨',
    label: 'Creativo',
    description: '5 creaciones',
    color: 'from-purple-400 to-pink-500'
  },
  explorer: {
    emoji: '🗺️',
    label: 'Explorador',
    description: 'Probaste todos los modos',
    color: 'from-green-400 to-teal-500'
  }
};

const AchievementBadge = React.memo(function AchievementBadge({ achievementId, size = 'md', showLabel = true }) {
  const achievement = achievements[achievementId];
  
  if (!achievement) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex flex-col items-center"
    >
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center shadow-lg`}>
        <span>{achievement.emoji}</span>
      </div>
      
      {showLabel && (
        <p className="mt-2 text-xs font-medium text-slate-600 text-center">
          {achievement.label}
        </p>
      )}
    </motion.div>
  );
});

export default AchievementBadge;

export { achievements };