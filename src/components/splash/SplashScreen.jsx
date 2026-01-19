import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Atom, Pencil, Settings } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(2), 1000),  // Fase 2: Construcción
      setTimeout(() => setPhase(3), 2500),  // Fase 3: Avatares
      setTimeout(() => setPhase(4), 3500),  // Fase 4: Asentamiento
      setTimeout(() => onComplete(), 4000)  // Completar
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-br from-sky-100 via-pink-50 to-orange-100">
      {/* Fase 1: La Chispa */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            exit={{ opacity: 0 }}
          >
            {/* Chispa central pulsante */}
            <motion.div
              className="relative"
              animate={{
                scale: [1, 1.3, 1, 1.3, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-300 via-pink-400 to-blue-400 rounded-full blur-sm" />
              <div className="absolute inset-0 w-8 h-8 bg-white rounded-full animate-ping" />
            </motion.div>

            {/* Partículas de la chispa */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-magenta-400 rounded-full"
                animate={{
                  x: Math.cos(i * 45 * Math.PI / 180) * 60,
                  y: Math.sin(i * 45 * Math.PI / 180) * 60,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{ duration: 1, delay: 0.5, repeat: 1 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fase 2: Construcción del Mundo */}
      <AnimatePresence>
        {phase >= 2 && phase < 4 && (
          <>
            {/* Onda expansiva */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-40 h-40 border-4 border-yellow-300 rounded-full" />
            </motion.div>

            {/* Paneles de cristal */}
            {[
              { x: -200, y: -100, rotation: -15, delay: 0 },
              { x: 200, y: -100, rotation: 15, delay: 0.1 },
              { x: -150, y: 100, rotation: -10, delay: 0.2 },
              { x: 150, y: 100, rotation: 10, delay: 0.3 }
            ].map((panel, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
                animate={{ 
                  x: panel.x, 
                  y: panel.y, 
                  opacity: 0.6, 
                  scale: 1,
                  rotate: panel.rotation
                }}
                transition={{ duration: 0.6, delay: panel.delay }}
              >
                <div className="w-32 h-40 bg-white/30 backdrop-blur-md rounded-2xl border border-white/50 shadow-2xl" />
              </motion.div>
            ))}

            {/* Íconos orbitando */}
            {[
              { Icon: BookOpen, angle: 0, color: 'text-blue-500' },
              { Icon: Atom, angle: 90, color: 'text-purple-500' },
              { Icon: Pencil, angle: 180, color: 'text-pink-500' },
              { Icon: Settings, angle: 270, color: 'text-green-500' }
            ].map(({ Icon, angle, color }, i) => (
              <motion.div
                key={i}
                className={`absolute top-1/2 left-1/2 ${color}`}
                animate={{
                  x: Math.cos((angle + phase * 90) * Math.PI / 180) * 120,
                  y: Math.sin((angle + phase * 90) * Math.PI / 180) * 120,
                  rotate: phase * 360
                }}
                transition={{ duration: 1, ease: "linear", repeat: Infinity }}
              >
                <Icon className="w-6 h-6" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Fase 3: La Llegada de los Guías */}
      <AnimatePresence>
        {phase >= 3 && (
          <div className="absolute inset-0 flex items-center justify-center gap-12">
            {/* Lia */}
            <motion.div
              initial={{ y: -200, opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{ 
                y: 0, 
                opacity: 1, 
                scale: 1, 
                rotate: 0 
              }}
              transition={{ 
                type: "spring", 
                damping: 8, 
                stiffness: 200,
                delay: 0.1 
              }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  y: phase === 4 ? [-5, 5, -5] : 0,
                  rotate: phase === 4 ? [-2, 2, -2] : 0
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl shadow-pink-500/50 border-4 border-white/50"
              >
                <span className="text-6xl">👧</span>
              </motion.div>
              
              {/* Mano saludando */}
              <motion.div
                className="absolute -top-2 -right-2 text-3xl"
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 0.5, delay: 0.5, repeat: 2 }}
              >
                👋
              </motion.div>
            </motion.div>

            {/* Leo */}
            <motion.div
              initial={{ y: -200, opacity: 0, scale: 0.5, rotate: 20 }}
              animate={{ 
                y: 0, 
                opacity: 1, 
                scale: 1, 
                rotate: 0 
              }}
              transition={{ 
                type: "spring", 
                damping: 8, 
                stiffness: 200,
                delay: 0.2 
              }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  y: phase === 4 ? [5, -5, 5] : 0,
                  rotate: phase === 4 ? [2, -2, 2] : 0
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="w-32 h-32 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl shadow-sky-500/50 border-4 border-white/50"
              >
                <span className="text-6xl">👦</span>
              </motion.div>
              
              {/* Gesto de acción */}
              <motion.div
                className="absolute -top-4 -right-4 text-3xl"
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                ⚡
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fase 4: Logo Sofia */}
      <AnimatePresence>
        {phase === 4 && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-12 left-1/2 -translate-x-1/2"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                Sofia
              </h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje de bienvenida */}
      <AnimatePresence>
        {phase === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-2xl font-bold text-slate-700">¡Hola!</p>
            <p className="text-lg text-slate-500">Bienvenido a Sofia</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Partículas de fondo continuas */}
      {phase >= 2 && [...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/60 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            y: [0, -50]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
}