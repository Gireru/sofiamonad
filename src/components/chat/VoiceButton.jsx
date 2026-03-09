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
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const utteranceRef = useRef(null);
  const wordsRef = useRef([]);

  useEffect(() => {
    // Preparar palabras para highlighting
    wordsRef.current = text.split(' ');

    // Cargar voces disponibles
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    if (autoPlay && text && voicesLoaded) {
      // Pequeño delay para que el mensaje se renderice primero
      const timer = setTimeout(() => speak(), 300);
      return () => clearTimeout(timer);
    }
  }, [text, autoPlay, voicesLoaded]);

  useEffect(() => {
    if (onPlayingChange) {
      onPlayingChange(isPlaying);
    }
  }, [isPlaying, onPlayingChange]);

  // Eliminar emojis y caracteres especiales del texto antes de leerlo
  const cleanTextForSpeech = (rawText) => {
    return rawText
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')  // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')  // Misc symbols & pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')  // Transport & map
      .replace(/[\u{1F700}-\u{1F77F}]/gu, '')  // Alchemical symbols
      .replace(/[\u{1F780}-\u{1F7FF}]/gu, '')  // Geometric shapes
      .replace(/[\u{1F800}-\u{1F8FF}]/gu, '')  // Supplemental arrows
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')  // Supplemental symbols
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')  // Chess symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')  // Symbols and pictographs extended
      .replace(/[\u{2600}-\u{26FF}]/gu, '')    // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')    // Dingbats
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')    // Variation selectors
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')  // Flags
      .replace(/\*\*/g, '')                     // Markdown bold
      .replace(/\*/g, '')                       // Markdown italic
      .replace(/_/g, ' ')                       // Markdown underline
      .replace(/#+\s/g, '')                     // Markdown headers
      .replace(/\s+/g, ' ')                     // Multiple spaces
      .trim();
  };

  const speak = () => {
    if ('speechSynthesis' in window) {
      // Cancelar cualquier lectura previa
      window.speechSynthesis.cancel();

      const cleanText = cleanTextForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utteranceRef.current = utterance;

      // Cargar preferencias de usuario
      const voiceSettings = JSON.parse(localStorage.getItem('sofia_voice_settings') || '{}');
      const { rate = 0.95, pitch, selectedVoiceUri } = voiceSettings;

      // Configurar voz según nombre del compañero
      // CASO A: Si nombre es "Lia" → voz femenina
      // CASO B: Si nombre es "Leo" → voz masculina
      // CASO C (DEFAULT): Cualquier otro nombre personalizado → voz de Leo (masculina energética)
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      let useFemaleVoice = companionName === 'Lia';

      // Si el usuario ha seleccionado una voz específica, usarla
      if (selectedVoiceUri) {
        selectedVoice = voices.find(v => v.voiceURI === selectedVoiceUri);
      }

      // Si no hay voz personalizada o no se encuentra, usar la lógica por defecto
      if (!selectedVoice) {
        if (useFemaleVoice) {
          // VOICE_FEM_SOFT: Lia usa Google Español de Estados Unidos
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('google') && 
            voice.lang.includes('es-US')
          ) || voices.find(voice => 
            voice.name.toLowerCase().includes('google') && 
            voice.lang.includes('es')
          ) || voices.find(voice => 
            voice.lang.includes('es-US') && 
            voice.name.toLowerCase().includes('female')
          ) || voices.find(voice => 
            voice.lang.includes('es') && 
            voice.name.toLowerCase().includes('female')
          ) || voices.find(voice => voice.lang.includes('es'));
        } else {
          // VOICE_MASC_ENERGETIC: Leo y nombres personalizados usan Google Español
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('google') && 
            (voice.lang.includes('es-ES') || voice.lang.includes('es-MX'))
          ) || voices.find(voice => 
            voice.name.toLowerCase().includes('google') && 
            voice.lang.includes('es')
          ) || voices.find(voice => 
            voice.lang.includes('es') && 
            voice.name.toLowerCase().includes('male')
          ) || voices.find(voice => voice.lang.includes('es'));
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Velocidad personalizable (0.95x default para mejor dicción)
      utterance.rate = rate;
      
      // Entonación: usar personalizada o default según género
      utterance.pitch = pitch !== undefined ? pitch : (useFemaleVoice ? 1.1 : 1.0);
      
      // Volumen máximo para claridad
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