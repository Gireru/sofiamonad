import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(2), 800),   // Fase 2: Logo aparece
      setTimeout(() => setPhase(3), 1800),  // Fase 3: Texto completo
      setTimeout(() => setPhase(4), 2800),  // Fase 4: Fade out
      setTimeout(() => {
        onComplete();
        navigate(createPageUrl('Home'));
      }, 3300)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [onComplete, navigate]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
      animate={{ opacity: phase === 4 ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ondas de fondo animadas */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            animate={{
              background: [
                `radial-gradient(circle at ${20 + i * 30}% ${30 + i * 20}%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
                `radial-gradient(circle at ${40 + i * 20}% ${60 + i * 15}%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
                `radial-gradient(circle at ${20 + i * 30}% ${30 + i * 20}%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>

      {/* Partículas flotantes */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      {/* Contenido principal */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Fase 1: Punto inicial */}
          {phase === 1 && (
            <motion.div
              key="phase1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative"
            >
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 0.8, repeat: 1 }}
                className="w-16 h-16 bg-white rounded-full shadow-2xl"
              />
              <motion.div
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{ duration: 0.8, repeat: 1 }}
                className="absolute inset-0 w-16 h-16 bg-white rounded-full"
              />
            </motion.div>
          )}

          {/* Fase 2: Logo emerge */}
          {phase === 2 && (
            <motion.div
              key="phase2"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 150 }}
              className="flex flex-col items-center"
            >
              {/* Icono */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative mb-6"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-white/30 rounded-3xl blur-xl scale-110"
                />
                <div className="relative w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-12 h-12 text-purple-500" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Texto Logo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-7xl font-black text-white tracking-tight">
                  Sofia
                </h1>
              </motion.div>
            </motion.div>
          )}

          {/* Fase 3: Mensaje completo */}
          {phase === 3 && (
            <motion.div
              key="phase3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center px-6"
            >
              {/* Icono con glow */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-8"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-white/40 rounded-3xl blur-2xl scale-125"
                />
                <div className="relative w-28 h-28 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity }
                    }}
                  >
                    <Sparkles className="w-14 h-14 text-gradient-to-br from-purple-500 to-pink-500" fill="currentColor" />
                  </motion.div>
                </div>

                {/* Anillos orbitales */}
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 border-4 border-white/30 rounded-full"
                    animate={{ 
                      scale: [1, 1.4, 1],
                      opacity: [0.6, 0, 0.6]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: i * 1
                    }}
                    style={{ width: '120%', height: '120%', left: '-10%', top: '-10%' }}
                  />
                ))}
              </motion.div>

              {/* Logo text */}
              <motion.h1 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-8xl font-black text-white mb-6 tracking-tight"
              >
                Sofia
              </motion.h1>

              {/* Subtítulo animado */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-200" />
                  </motion.div>
                  <p className="text-white text-lg font-semibold">
                    Tu compañero de estudio inteligente
                  </p>
                </motion.div>

                {/* Puntos de carga */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-2 mt-4"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-white rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}