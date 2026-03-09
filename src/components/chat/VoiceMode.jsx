import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff } from 'lucide-react';

// Carita minimalista animada
function TalkingFace({ state, avatarType }) {
  // state: 'idle' | 'listening' | 'thinking' | 'talking'

  const gradients = {
    robot: ['#38bdf8', '#6366f1'],
    owl:   ['#fbbf24', '#f97316'],
    fox:   ['#fb923c', '#ef4444'],
    boy:   ['#22d3ee', '#3b82f6'],
    girl:  ['#f472b6', '#a855f7'],
  };
  const [c1, c2] = gradients[avatarType] || gradients.robot;

  // Número de barras de voz (para estado talking/listening)
  const bars = [0.4, 0.9, 0.6, 1, 0.7, 0.5, 0.8];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Carita */}
      <motion.div
        className="relative"
        animate={state === 'listening' ? { scale: [1, 1.04, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {/* Glow de fondo */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: `radial-gradient(circle, ${c1}55, ${c2}33)` }}
          animate={{ scale: state === 'talking' ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.4, repeat: Infinity }}
        />

        {/* Círculo principal */}
        <motion.svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          className="relative z-10 drop-shadow-2xl"
        >
          {/* Cara base */}
          <defs>
            <radialGradient id="faceGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor={c1} />
              <stop offset="100%" stopColor={c2} />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="72" fill="url(#faceGrad)" />
          <circle cx="80" cy="80" r="72" fill="white" fillOpacity="0.08" />

          {/* Ojos */}
          {/* Ojo izquierdo */}
          <motion.ellipse
            cx="58" cy="68"
            rx="9" ry={state === 'thinking' ? 4 : 9}
            fill="white"
            animate={{ ry: state === 'thinking' ? [9, 3, 9] : 9 }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          {/* Pupila izquierda */}
          <motion.circle
            cx="60" cy="70" r="5" fill="#1e293b"
            animate={state === 'listening' ? { cy: [70, 67, 70] } : {}}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <circle cx="62" cy="67" r="1.5" fill="white" opacity="0.8" />

          {/* Ojo derecho */}
          <motion.ellipse
            cx="102" cy="68"
            rx="9" ry={state === 'thinking' ? 4 : 9}
            fill="white"
            animate={{ ry: state === 'thinking' ? [9, 3, 9] : 9 }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, delay: 0.1 }}
          />
          {/* Pupila derecha */}
          <motion.circle
            cx="104" cy="70" r="5" fill="#1e293b"
            animate={state === 'listening' ? { cy: [70, 67, 70] } : {}}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.1 }}
          />
          <circle cx="106" cy="67" r="1.5" fill="white" opacity="0.8" />

          {/* Boca */}
          {state === 'idle' && (
            <motion.path
              d="M 58 100 Q 80 115 102 100"
              stroke="white" strokeWidth="4.5" fill="none" strokeLinecap="round"
              animate={{ d: ["M 58 100 Q 80 115 102 100", "M 58 102 Q 80 116 102 102", "M 58 100 Q 80 115 102 100"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          )}
          {state === 'listening' && (
            <motion.path
              d="M 62 100 Q 80 110 98 100"
              stroke="white" strokeWidth="4.5" fill="none" strokeLinecap="round"
              animate={{ d: ["M 62 100 Q 80 108 98 100", "M 62 102 Q 80 112 98 102"] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
            />
          )}
          {state === 'thinking' && (
            <motion.path
              d="M 65 103 Q 80 100 95 103"
              stroke="white" strokeWidth="4.5" fill="none" strokeLinecap="round"
              animate={{ d: ["M 65 103 Q 80 100 95 103", "M 65 105 Q 80 101 95 105"] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            />
          )}
          {state === 'talking' && (
            <motion.ellipse
              cx="80" cy="103"
              rx="18" ry="10"
              fill="white" fillOpacity="0.9"
              animate={{ ry: [5, 12, 7, 10, 5], rx: [16, 18, 14, 18, 16] }}
              transition={{ duration: 0.35, repeat: Infinity }}
            />
          )}

          {/* Mejillas */}
          {(state === 'idle' || state === 'talking') && (
            <>
              <ellipse cx="44" cy="92" rx="11" ry="7" fill="white" fillOpacity="0.18" />
              <ellipse cx="116" cy="92" rx="11" ry="7" fill="white" fillOpacity="0.18" />
            </>
          )}
        </motion.svg>
      </motion.div>

      {/* Barras de audio (listening / talking) */}
      <AnimatePresence>
        {(state === 'listening' || state === 'talking') && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-1.5 h-10"
          >
            {bars.map((h, i) => (
              <motion.div
                key={i}
                className="w-1.5 rounded-full"
                style={{ background: `linear-gradient(to top, ${c1}, ${c2})` }}
                animate={{
                  height: state === 'listening'
                    ? [`${h * 20 + 6}px`, `${h * 34 + 6}px`, `${h * 14 + 6}px`]
                    : [`${h * 32 + 4}px`, `${h * 12 + 4}px`, `${h * 40 + 4}px`]
                }}
                transition={{ duration: 0.5 + i * 0.07, repeat: Infinity, repeatType: 'reverse', delay: i * 0.06 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VoiceMode({ profile, onSend, isThinking, onClose }) {
  const [state, setState] = useState('idle'); // idle | listening | thinking | talking
  const [transcript, setTranscript] = useState('');
  const [statusText, setStatusText] = useState('Toca el micrófono para hablar');
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopListening();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Sincronizar estado de thinking
  useEffect(() => {
    if (isThinking) {
      setState('thinking');
      setStatusText('Pensando...');
    }
  }, [isThinking]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusText('Tu navegador no soporta reconocimiento de voz 😅');
      return;
    }

    window.speechSynthesis?.cancel();
    listeningRef.current = true;
    setState('listening');
    setTranscript('');
    setStatusText('Escuchando... habla ahora 🎙️');

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'es-MX';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(final || interim);
    };

    recognition.onend = () => {
      if (!listeningRef.current) return;
      listeningRef.current = false;
      if (transcript || recognitionRef.current?._finalTranscript) {
        const msg = recognitionRef.current?._finalTranscript || transcript;
        if (msg.trim()) {
          sendMessage(msg.trim());
        } else {
          setState('idle');
          setStatusText('No te escuché bien, inténtalo de nuevo');
          setTranscript('');
        }
      } else {
        // Capturar el transcript del estado antes del cierre
        setTranscript(prev => {
          if (prev.trim()) {
            sendMessage(prev.trim());
          } else {
            setState('idle');
            setStatusText('No te escuché bien, inténtalo de nuevo');
          }
          return prev;
        });
      }
    };

    recognition.onerror = () => {
      listeningRef.current = false;
      setState('idle');
      setStatusText('Error al escuchar, intenta de nuevo');
    };

    recognition.start();
  };

  const stopListening = () => {
    listeningRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current?.abort();
  };

  const sendMessage = (text) => {
    setState('thinking');
    setStatusText('Pensando...');
    setTranscript('');
    onSend(text, (responseText) => {
      speakResponse(responseText);
    });
  };

  // Esta función es llamada desde el Chat con la respuesta
  const speakResponse = (text) => {
    if (!text || !('speechSynthesis' in window)) return;

    const clean = text
      .replace(/[\u{1F600}-\u{1FAFF}]/gu, '')
      .replace(/\*\*/g, '').replace(/\*/g, '').replace(/#+\s/g, '')
      .replace(/\s+/g, ' ').trim();

    const utterance = new SpeechSynthesisUtterance(clean);
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.includes('es')) || null;
    if (esVoice) utterance.voice = esVoice;
    utterance.rate = 0.95;
    utterance.lang = 'es-MX';

    utterance.onstart = () => {
      setState('talking');
      setStatusText(`${profile?.companion_name || 'Sofia'} está hablando...`);
    };
    utterance.onend = () => {
      setState('idle');
      setStatusText('Toca el micrófono para hablar');
    };
    utterance.onerror = () => {
      setState('idle');
      setStatusText('Toca el micrófono para hablar');
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleMicClick = () => {
    if (state === 'listening') {
      stopListening();
      setState('idle');
      setStatusText('Toca el micrófono para hablar');
    } else if (state === 'talking') {
      window.speechSynthesis.cancel();
      setState('idle');
      setStatusText('Toca el micrófono para hablar');
    } else if (state === 'idle') {
      startListening();
    }
  };

  // Exponer speakResponse al padre via ref no es posible directamente,
  // así que lo manejamos con un efecto que escucha cambios en isThinking -> false
  // El chat llamará onSend con un callback

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c1445 100%)' }}
    >
      {/* Estrellas de fondo */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.2
          }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      {/* Botón cerrar */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white/70 flex items-center justify-center hover:bg-white/20 transition-all"
      >
        <X className="w-5 h-5" />
      </motion.button>

      {/* Nombre del compañero */}
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white/60 text-sm font-medium mb-6 tracking-widest uppercase"
      >
        {profile?.companion_name || 'Sofia'}
      </motion.p>

      {/* Carita */}
      <TalkingFace state={state} avatarType={profile?.avatar_type || 'robot'} />

      {/* Transcript */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 px-6 py-3 bg-white/10 rounded-2xl max-w-xs text-center"
          >
            <p className="text-white/90 text-sm italic">"{transcript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status text */}
      <motion.p
        key={statusText}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-5 text-white/50 text-sm text-center px-8"
      >
        {statusText}
      </motion.p>

      {/* Botón micrófono */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleMicClick}
        disabled={state === 'thinking'}
        className={`mt-8 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all
          ${state === 'listening'
            ? 'bg-red-500 shadow-red-500/50'
            : state === 'talking'
            ? 'bg-sky-500 shadow-sky-500/50'
            : state === 'thinking'
            ? 'bg-white/10 cursor-not-allowed'
            : 'bg-white/20 hover:bg-white/30 shadow-white/10'}
        `}
      >
        {state === 'listening' ? (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
            <MicOff className="w-8 h-8 text-white" />
          </motion.div>
        ) : state === 'thinking' ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-3 border-white/40 border-t-white rounded-full"
            style={{ borderWidth: 3 }}
          />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </motion.button>

      <p className="mt-4 text-white/30 text-xs">
        {state === 'listening' ? 'Toca para parar' : state === 'talking' ? 'Toca para interrumpir' : 'Toca para hablar'}
      </p>
    </motion.div>
  );
}