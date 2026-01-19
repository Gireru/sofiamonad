import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Sparkles, BookOpen, Palette, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import ThinkingIndicator from '@/components/chat/ThinkingIndicator';
import Avatar3D from '@/components/avatars/Avatar3D';

const modes = {
  tutor: { 
    label: 'Tutor', 
    icon: BookOpen, 
    color: 'from-green-400 to-emerald-500',
    description: 'Ayuda con tus tareas y materias'
  },
  creative: { 
    label: 'Creativo', 
    icon: Palette, 
    color: 'from-purple-400 to-pink-500',
    description: 'Genera imágenes y presentaciones'
  },
  free: { 
    label: 'Recreo', 
    icon: MessageCircle, 
    color: 'from-orange-400 to-amber-500',
    description: 'Platica libre sin memoria académica'
  }
};

export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentMode, setCurrentMode] = useState('tutor');
  const [avatarState, setAvatarState] = useState('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthRef = useRef(null);

  useEffect(() => {
    loadProfile();
    
    // Cleanup speech on unmount
    return () => {
      if (speechSynthRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const loadProfile = async () => {
    try {
      // Cargar perfil local primero
      const localProfile = localStorage.getItem('sofia_profile');
      let currentProfile = null;

      if (localProfile) {
        currentProfile = JSON.parse(localProfile);
        if (!currentProfile.onboarding_completed) {
          navigate(createPageUrl('Onboarding'));
          return;
        }
        setProfile(currentProfile);
      }

      // Si está autenticado, cargar desde base de datos
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        const profiles = await base44.entities.StudentProfile.filter({ created_by: user.email });
        
        if (profiles.length > 0) {
          currentProfile = profiles[0];
          setProfile(currentProfile);
          localStorage.setItem('sofia_profile', JSON.stringify(currentProfile));
        }
      } else if (!localProfile) {
        navigate(createPageUrl('Onboarding'));
        return;
      }

      if (currentProfile) {
        // Welcome message
        const greetings = [
          `¡Hola ${currentProfile.display_name}! 🌟 ¿En qué te puedo ayudar hoy?`,
          `¡${currentProfile.display_name}! 🎉 Me da gusto verte. ¿Qué vamos a aprender?`,
          `¡Hey ${currentProfile.display_name}! ✨ Estoy listo para nuestra aventura de hoy.`
        ];
        
        setMessages([{
          role: 'assistant',
          content: greetings[Math.floor(Math.random() * greetings.length)]
        }]);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      const localProfile = localStorage.getItem('sofia_profile');
      if (localProfile) {
        const parsed = JSON.parse(localProfile);
        setProfile(parsed);
        setMessages([{
          role: 'assistant',
          content: `¡Hola ${parsed.display_name}! 🌟 ¿En qué te puedo ayudar hoy?`
        }]);
      } else {
        navigate(createPageUrl('Onboarding'));
      }
    }
  };

  const getSystemPrompt = () => {
    if (!profile) return '';
    
    const gradeLabels = {
      '1_primaria': '1° de primaria', '2_primaria': '2° de primaria',
      '3_primaria': '3° de primaria', '4_primaria': '4° de primaria',
      '5_primaria': '5° de primaria', '6_primaria': '6° de primaria',
      '1_secundaria': '1° de secundaria', '2_secundaria': '2° de secundaria',
      '3_secundaria': '3° de secundaria'
    };

    const isPrimary = profile.grade?.includes('primaria');
    const gradeNumber = parseInt(profile.grade?.split('_')[0] || '4');
    
    let toneInstructions = '';
    if (gradeNumber <= 2) {
      toneInstructions = 'Usa frases muy cortas y simples. Incluye muchos emojis (3-5 por mensaje). Explica como si hablaras con un niño pequeño curioso.';
    } else if (gradeNumber <= 4) {
      toneInstructions = 'Usa un tono amigable y entusiasta. Incluye algunos emojis (2-3 por mensaje). Da ejemplos cotidianos y divertidos.';
    } else if (isPrimary) {
      toneInstructions = 'Usa un tono motivador pero no infantil. Puedes usar algunos emojis estratégicamente. Fomenta el pensamiento crítico.';
    } else {
      toneInstructions = 'Usa un tono cool y cercano, como un hermano mayor. Menos emojis, más contenido retador. Puedes usar referencias a cultura pop actual.';
    }

    const modeInstructions = {
      tutor: `Estás en modo TUTOR. Tu objetivo es ayudar con tareas y materias escolares.
      - Si piden que hagas la tarea completa, di: "¡Mejor lo hacemos juntos! ¿Qué tal si tú empiezas y yo te ayudo?"
      - Usa los contenidos de los Libros de la SEP de México como referencia principal.
      - Explica paso a paso, verificando que entienda antes de avanzar.`,
      creative: `Estás en modo CREATIVO. Puedes ayudar a generar ideas para:
      - Dibujos conceptuales (describiendo cómo sería la imagen)
      - Presentaciones escolares
      - Historias y cuentos
      - Proyectos de arte`,
      free: `Estás en modo RECREO. Es hora de platicar libremente.
      - No hay memoria académica en este modo
      - Puedes hablar de juegos, películas, hobbies
      - Mantén un ambiente positivo y divertido`
    };

    return `Eres ${profile.companion_name}, el compañero de estudio en la plataforma Sofia.

INFORMACIÓN DEL ESTUDIANTE:
- Nombre: ${profile.display_name}
- Grado: ${gradeLabels[profile.grade] || 'primaria'}

PERSONALIDAD:
- Eres curioso, paciente y siempre usas lenguaje positivo
- Nunca regañas ni haces sentir mal al estudiante
- ${toneInstructions}

MODO ACTUAL: ${modes[currentMode].label}
${modeInstructions[currentMode]}

REGLAS DE SEGURIDAD:
- Filtro estricto contra violencia, odio y temas adultos
- Si preguntan algo inapropiado, redirige amablemente a otro tema
- Siempre fomenta valores positivos

FORMATO:
- Usa markdown para estructurar respuestas largas
- Usa listas cuando expliques pasos o conceptos
- Mantén las respuestas concisas pero completas`;
  };

  const handleSend = async (message) => {
    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);
    setAvatarState('thinking');

    try {
      // Detectar si el estudiante pide generar una imagen
      const imageKeywords = [
        'dibuja', 'dibújame', 'genera una imagen', 'crea una imagen', 
        'hazme un dibujo', 'muéstrame', 'ilustra', 'explícalo con un dibujo',
        'haz un dibujo', 'puedes dibujar', 'imagen de'
      ];
      
      const requestsImage = imageKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );

      if (requestsImage) {
        // Generar imagen educativa
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `¡Perfecto! Voy a crear un dibujo para ti... 🎨✨` 
        }]);

        const imagePrompt = `Educational illustration, 3D Render, Pixar style, colorful and child-friendly, warm lighting, high quality: ${message}. 
Negative prompt: violence, scary, dark, photorealistic, adult content, weapons, blood`;

        const { url } = await base44.integrations.Core.GenerateImage({
          prompt: imagePrompt
        });

        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `¡Aquí está! 🎉`,
          image: url
        }]);
      } else {
        // Respuesta normal del LLM
        const fullPrompt = `${getSystemPrompt()}\n\nHistorial de conversación:\n${messages.map(m => `${m.role === 'user' ? profile?.display_name : profile?.companion_name}: ${m.content}`).join('\n')}\n\n${profile?.display_name}: ${message}\n\n${profile?.companion_name}:`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: fullPrompt,
          add_context_from_internet: currentMode === 'tutor'
        });

        const assistantMsg = { role: 'assistant', content: aiResponse };
        setMessages(prev => [...prev, assistantMsg]);
        
        // Auto-reproducir respuesta con voz
        setTimeout(() => speakMessage(aiResponse), 300);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '¡Ups! 😅 Algo salió mal. ¿Puedes intentar de nuevo?' 
      }]);
    }

    setIsThinking(false);
    setAvatarState('idle');
  };

  const getVoiceConfig = () => {
    if (!profile?.companion_name) return { pitch: 1, rate: 0.95 };
    
    const name = profile.companion_name.toLowerCase();
    
    // CASO A: Lia (VOICE_FEM_SOFT)
    if (name === 'lia') {
      return {
        pitch: 1.2,        // Tono más alto (dulce)
        rate: 0.9,         // Más pausado
        voicePattern: 'female'
      };
    }
    
    // CASO B: Leo (VOICE_MASC_ENERGETIC)
    if (name === 'leo') {
      return {
        pitch: 0.9,        // Tono más bajo (aventurero)
        rate: 0.95,        // Energético pero claro
        voicePattern: 'male'
      };
    }
    
    // CASO C (DEFAULT): Personalizado -> usar voz de Leo
    return {
      pitch: 0.9,
      rate: 0.95,
      voicePattern: 'male'
    };
  };

  const speakMessage = (text) => {
    // Cancelar cualquier voz previa
    window.speechSynthesis.cancel();
    
    // Remover markdown y emojis para mejor pronunciación
    const cleanText = text
      .replace(/[*_~`#]/g, '')
      .replace(/[🎨🎉✨🌟😅👋💡📚🚀⚡🔥]/g, '')
      .replace(/\n/g, '. ');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const config = getVoiceConfig();
    
    utterance.pitch = config.pitch;
    utterance.rate = config.rate;
    utterance.volume = 1;
    utterance.lang = 'es-MX';
    
    // Intentar seleccionar voz específica
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('es') && 
      (config.voicePattern === 'female' ? voice.name.includes('female') || voice.name.includes('Mónica') || voice.name.includes('Paulina') : 
       voice.name.includes('male') || voice.name.includes('Diego') || voice.name.includes('Juan'))
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setAvatarState('talking');
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setAvatarState('idle');
    };
    
    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setAvatarState('idle');
    } else {
      setIsListening(!isListening);
      setAvatarState(isListening ? 'idle' : 'listening');
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <Avatar3D 
                type={profile.avatar_type} 
                size="sm" 
                state={avatarState}
              />
              <div>
                <h1 className="font-bold text-slate-800">{profile.companion_name}</h1>
                <p className="text-xs text-slate-500">Tu compañero de estudio</p>
              </div>
            </div>
          </div>

          {/* Mode selector */}
          <div className="flex gap-2">
            {Object.entries(modes).map(([key, mode]) => {
              const Icon = mode.icon;
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentMode(key)}
                  className={`
                    px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all
                    ${currentMode === key 
                      ? `bg-gradient-to-r ${mode.color} text-white shadow-lg` 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                message={msg.content}
                isUser={msg.role === 'user'}
                avatarType={profile.avatar_type}
                companionName={profile.companion_name}
                userName={profile.display_name}
                image={msg.image}
                onSpeak={msg.role === 'assistant' ? speakMessage : null}
              />
            ))}
            
            {isThinking && (
              <ThinkingIndicator 
                avatarType={profile.avatar_type}
                companionName={profile.companion_name}
              />
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onVoiceToggle={toggleVoice}
        isListening={isListening}
        disabled={isThinking}
        placeholder={`Escribe a ${profile.companion_name}...`}
      />
    </div>
  );
}