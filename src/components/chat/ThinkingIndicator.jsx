import React from 'react';
import { motion } from 'framer-motion';
import Avatar3D from '../avatars/Avatar3D';

export default function ThinkingIndicator({ 
  avatarType = 'robot', 
  companionName = 'Lia' 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-3 items-start"
    >
      <Avatar3D type={avatarType} size="sm" state="thinking" />
      
      <div className="flex flex-col items-start">
        <span className="text-xs text-slate-400 mb-1 px-2">{companionName}</span>
        
        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Animated backpack search */}
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-2xl"
            >
              🎒
            </motion.div>
            
            <div className="flex flex-col">
              <span className="text-sm text-slate-600 font-medium">
                Buscando en mi mochila mágica...
              </span>
              
              {/* Animated dots */}
              <div className="flex gap-1 mt-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-sky-400"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 0.8, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Flying sparkles */}
            <div className="relative w-8 h-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-400 text-sm"
                  animate={{
                    y: [0, -20, 0],
                    x: [0, (i - 1) * 10, 0],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}