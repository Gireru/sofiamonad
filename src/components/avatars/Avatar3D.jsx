import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const avatarConfigs = {
  robot: {
    emoji: '🤖',
    gradient: 'from-sky-400 to-blue-500',
    glow: 'shadow-sky-400/50',
    name: 'Robotito'
  },
  owl: {
    emoji: '🦉',
    gradient: 'from-amber-400 to-orange-500',
    glow: 'shadow-amber-400/50',
    name: 'Búho Sabio'
  },
  fox: {
    emoji: '🦊',
    gradient: 'from-orange-400 to-red-500',
    glow: 'shadow-orange-400/50',
    name: 'Zorro Explorador'
  },
  boy: {
    emoji: '👦',
    gradient: 'from-cyan-400 to-blue-500',
    glow: 'shadow-cyan-400/50',
    name: 'Niño'
  },
  girl: {
    emoji: '👧',
    gradient: 'from-pink-400 to-purple-500',
    glow: 'shadow-pink-400/50',
    name: 'Niña'
  }
};

const sizeClasses = {
  sm: 'w-12 h-12 text-2xl',
  md: 'w-20 h-20 text-4xl',
  lg: 'w-32 h-32 text-6xl',
  xl: 'w-40 h-40 text-7xl'
};

const stateAnimations = {
  idle: {
    y: [0, -5, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  listening: {
    scale: [1, 1.1, 1],
    rotate: [-5, 5, -5],
    transition: { duration: 0.5, repeat: Infinity }
  },
  thinking: {
    rotate: [0, -10, 10, 0],
    transition: { duration: 1, repeat: Infinity }
  },
  talking: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.3, repeat: Infinity }
  }
};

const Avatar3D = React.memo(function Avatar3D({ 
  type = 'robot', 
  size = 'md', 
  state = 'idle', 
  className = '' 
}) {
  const config = useMemo(() => avatarConfigs[type] || avatarConfigs.robot, [type]);

  return (
    <motion.div
      className={`relative ${className}`}
      animate={stateAnimations[state]}
    >
      {/* Glow effect */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-full blur-xl opacity-40`}
        animate={{ scale: state === 'listening' ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      
      {/* Main avatar container */}
      <div className={`
        relative ${sizeClasses[size]} 
        bg-gradient-to-br ${config.gradient}
        rounded-full flex items-center justify-center
        shadow-2xl ${config.glow}
        border-4 border-white/30
      `}>
        {/* Inner glow */}
        <div className="absolute inset-2 bg-white/20 rounded-full blur-sm" />
        
        {/* Avatar emoji */}
        <span className="relative z-10 drop-shadow-lg">
          {config.emoji}
        </span>
        
        {/* Listening indicator */}
        {state === 'listening' && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
        
        {/* Thinking sparkles */}
        {state === 'thinking' && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos(i * 120 * Math.PI / 180) * 40,
                  y: Math.sin(i * 120 * Math.PI / 180) * 40
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.3 
                }}
              />
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
});

export default Avatar3D;
export { avatarConfigs };