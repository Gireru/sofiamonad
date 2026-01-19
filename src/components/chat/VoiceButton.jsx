import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VoiceButton({ 
  text, 
  companionPersonality = 'lia',
  companionName = 'Lia',
  onPlayingChange,
  autoPlay = false 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const utteranceRef = useRef(null);
  const wordsRef = useRef([]);

  useEffect(() => {
    // Preparar palabras para highlighting
    wordsRef.current = text.split(' ');

    if (autoPlay && text) {
      // Pequeño delay para que el mensaje se renderice primero
      const timer = setTimeout(() => speak(), 300);
      return () => clearTimeout(timer);
    }
  }, [text, autoPlay]);

  useEffect(() => {
    if (onPlayingChange) {
      onPlayingChange(isPlaying);
    }
  }, [isPlaying, onPlayingChange]);

  const speak = () => {
    if ('speechSynthesis' in window) {
      // Cancelar cualquier lectura previa
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Configurar voz según nombre del compañero
      // CASO A: Si nombre es "Lia" → voz femenina
      // CASO B: Si nombre es "Leo" → voz masculina
      // CASO C (DEFAULT): Cualquier otro nombre personalizado → voz de Leo (masculina energética)
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      let useFemaleVoice = false;

      // Determinar si usar voz femenina o masculina
      if (companionName === 'Lia') {
        useFemaleVoice = true;
      } else {
        // Leo o cualquier nombre personalizado → voz masculina (default)
        useFemaleVoice = false;
      }

      if (useFemaleVoice) {
        // VOICE_FEM_SOFT: Buscar voz femenina en español (Tono dulce, pausado, estilo narradora)
        selectedVoice = voices.find(voice => 
          voice.lang.includes('es') && voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => 
          voice.lang.includes('es') && voice.name.toLowerCase().includes('mujer')
        ) || voices.find(voice => 
          voice.lang.includes('es') && voice.name.toLowerCase().includes('paulina')
        ) || voices.find(voice => voice.lang.includes('es'));
      } else {
        // VOICE_MASC_ENERGETIC: Buscar voz masculina en español (Tono aventurero, seguro, amigable)
        selectedVoice = voices.find(voice => 
          voice.lang.includes('es') && voice.name.toLowerCase().includes('male')
        ) || voices.find(voice => 
          voice.lang.includes('es') && voice.name.toLowerCase().includes('hombre')
        ) || voices.find(voice => 
          voice.lang.includes('es') && voice.name.toLowerCase().includes('jorge')
        ) || voices.find(voice => voice.lang.includes('es'));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Velocidad: 0.95x (ligeramente más lento para mejorar dicción en palabras educativas)
      utterance.rate = 0.95;
      // Entonación: alta variabilidad para evitar tono monótono
      utterance.pitch = useFemaleVoice ? 1.1 : 1.0;
      utterance.volume = 1;

      // Eventos
      utterance.onstart = () => {
        setIsPlaying(true);
        setCurrentWordIndex(0);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentWordIndex(-1);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentWordIndex(-1);
      };

      // Simular highlight palabra por palabra
      // Como boundary no está disponible en todos los navegadores, usamos un aproximado
      const words = text.split(' ');
      const avgWordDuration = (text.length / words.length) * 100; // ms aproximado por palabra
      
      let wordIndex = 0;
      const interval = setInterval(() => {
        if (wordIndex < words.length && isPlaying) {
          setCurrentWordIndex(wordIndex);
          wordIndex++;
        } else {
          clearInterval(interval);
        }
      }, avgWordDuration);

      utterance.onend = () => {
        clearInterval(interval);
        setIsPlaying(false);
        setCurrentWordIndex(-1);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    }
  };

  const handleClick = () => {
    if (isPlaying) {
      stopSpeaking();
    } else {
      speak();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={`
          rounded-full transition-all
          ${isPlaying 
            ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-400/50' 
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
        `}
      >
        {isPlaying ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <Volume2 className="w-5 h-5" />
          </motion.div>
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </Button>
    </motion.div>
  );
}

export function HighlightedText({ text, currentWordIndex }) {
  const words = text.split(' ');

  return (
    <span>
      {words.map((word, index) => (
        <span
          key={index}
          className={`transition-all duration-300 ${
            index === currentWordIndex 
              ? 'bg-yellow-200 text-slate-900 font-semibold px-1 rounded' 
              : ''
          }`}
        >
          {word}{' '}
        </span>
      ))}
    </span>
  );
}