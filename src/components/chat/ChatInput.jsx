import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Sparkles } from 'lucide-react';

export default function ChatInput({ 
  onSend, 
  disabled = false,
  placeholder = "Escribe tu mensaje...",
  isAISpeaking = false
}) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // Inicializar reconocimiento de voz
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-MX';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      const current = (final || interim).trim();
      setTranscript(current);

      // Reiniciar timer de silencio cada vez que hay resultado
      clearTimeout(silenceTimerRef.current);
      if (final) {
        // Si hay resultado final, esperar 1.2s de silencio y enviar
        silenceTimerRef.current = setTimeout(() => {
          if (final.trim()) {
            stopListening();
            onSend(final.trim());
            setTranscript('');
          }
        }, 1200);
      }
    };

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Si sigue en modo escucha, reiniciar automáticamente
      if (recognitionRef.current?._shouldRestart) {
        try { recognition.start(); } catch (_) {}
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearTimeout(silenceTimerRef.current);
      try { recognition.stop(); } catch (_) {}
    };
  }, [onSend]);

  // Cuando la IA empieza a hablar, pausar el micrófono; cuando termina, reactivarlo
  useEffect(() => {
    if (!recognitionRef.current) return;
    if (isAISpeaking && isListening) {
      // Pausar escucha mientras habla la IA
      recognitionRef.current._shouldRestart = false;
      try { recognitionRef.current.stop(); } catch (_) {}
    } else if (!isAISpeaking && isListening) {
      // Reanudar escucha cuando la IA termina
      recognitionRef.current._shouldRestart = true;
      try { recognitionRef.current.start(); } catch (_) {}
    }
  }, [isAISpeaking]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setIsListening(true);
    setTranscript('');
    recognitionRef.current._shouldRestart = true;
    try { recognitionRef.current.start(); } catch (_) {}
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current._shouldRestart = false;
    setIsListening(false);
    setTranscript('');
    clearTimeout(silenceTimerRef.current);
    try { recognitionRef.current.stop(); } catch (_) {}
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const hasSpeechSupport = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div className="bg-white/80 backdrop-blur-lg border-t border-slate-100 p-4">
      <div className="max-w-4xl mx-auto">

        {/* Voice mode active UI */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl border border-sky-200"
            >
              {/* Animated mic waves */}
              <div className="flex items-center gap-1">
                {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-sky-500 rounded-full"
                    animate={{ height: isAISpeaking ? 4 : [8, 20, 8] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay }}
                  />
                ))}
              </div>

              <p className="flex-1 text-sm text-slate-600 italic min-h-[20px]">
                {isAISpeaking
                  ? <span className="text-indigo-500 font-medium">Escuchando a {placeholder?.split(' ')[2] || 'tu compañero'}...</span>
                  : transcript
                    ? <span className="text-slate-700">{transcript}</span>
                    : <span className="text-slate-400">Te escucho... habla cuando quieras</span>
                }
              </p>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={stopListening}
                className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50"
              >
                Detener
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-3">
          {/* Mic button */}
          {hasSpeechSupport && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleVoice}
              disabled={disabled}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 mb-0.5
                ${isListening
                  ? 'bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-400/40'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
              `}
            >
              {isListening ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <Mic className="w-5 h-5" />
                </motion.div>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </motion.button>
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="resize-none rounded-2xl border-2 border-slate-200 focus:border-sky-400 
                bg-white pr-4 py-3 min-h-[48px] max-h-[120px] text-slate-700
                placeholder:text-slate-400"
              rows={1}
            />
          </div>

          {/* Send button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mb-0.5">
            <Button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              className={`
                w-12 h-12 rounded-full p-0 shadow-lg transition-all
                ${message.trim()
                  ? 'bg-gradient-to-br from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 shadow-sky-500/30'
                  : 'bg-slate-200 shadow-none'}
              `}
            >
              <Send className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['Explícame con un dibujo', 'Dame un ejemplo', 'Tengo una tarea'].map((suggestion) => (
            <motion.button
              key={suggestion}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMessage(suggestion)}
              className="px-3 py-1.5 rounded-full bg-sky-50 text-sky-600 text-sm font-medium
                border border-sky-200 hover:bg-sky-100 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              {suggestion}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}