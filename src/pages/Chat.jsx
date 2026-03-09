import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Sparkles, BookOpen, Palette, MessageCircle, Save, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import ThinkingIndicator from '@/components/chat/ThinkingIndicator';
import Avatar3D from '@/components/avatars/Avatar3D';
import VoiceMode from '@/components/chat/VoiceMode';

const modes = {
  tutor: { 
    label: 'Tutor', 
    icon: BookOpen, 
    color: 'from-green-400 to-emerald-500',
    description: 'Ayuda con tus tareas y materias'
  },
  exam: { 
    label: 'Examen', 
    icon: GraduationCap, 
    color: 'from-indigo-400 to-violet-500',
    description: 'Estudia para tus exámenes'
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
  const [autoPlayVoice, setAutoPlayVoice] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [needsManualSave, setNeedsManualSave] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestQuestionCount, setGuestQuestionCount] = useState(0);
  const [homeworkMode, setHomeworkMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const voiceCallbackRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'guest') {
      setIsGuestMode(true);
      setProfile({
        display_name: 'Invitado',
        avatar_type: 'robot',
        companion_name: 'Sofia',
        grade: '4_primaria'
      });
      setMessages([{
        role: 'assistant',
        content: '¡Hola! 🌟 Soy Sofia, tu compañera de estudio. Puedes hacerme 3 preguntas gratis para probarme. ¿Qué quieres saber?'
      }]);
    } else if (params.get('homework') === 'true') {
      setHomeworkMode(true);
      loadProfile();
    } else {
      loadProfile();
    }
  }, []);

  useEffect(() => {
    if (profile) {
      loadConversationFromURL();
    }
  }, [profile]);

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
        // Determinar auto-play y auto-save según grado
        const gradeNumber = parseInt(currentProfile.grade?.split('_')[0] || '4');
        const isPrimary = currentProfile.grade?.includes('primaria');
        const shouldAutoPlay = gradeNumber >= 1 && gradeNumber <= 3 && isPrimary;
        
        // 1º-3º primaria: auto-save, 4º primaria en adelante: manual save
        const isAutoSave = gradeNumber >= 1 && gradeNumber <= 3 && isPrimary;
        setNeedsManualSave(!isAutoSave);
        
        // Verificar configuración del usuario (por defecto true para Nivel 1)
        const userPreference = localStorage.getItem('sofia_autoplay_voice');
        if (userPreference !== null) {
          setAutoPlayVoice(userPreference === 'true');
        } else {
          setAutoPlayVoice(shouldAutoPlay);
          localStorage.setItem('sofia_autoplay_voice', shouldAutoPlay.toString());
        }

        // Welcome message
        if (homeworkMode) {
          setMessages([{
            role: 'assistant',
            content: `¡Hola ${currentProfile.display_name}! 📸 Toma una foto de tu tarea o súbela desde tu galería. Después dime en qué necesitas ayuda y te guiaré paso a paso. ¡Vamos a resolverla juntos! 💪`
          }]);
        } else {
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
    
    // MOTOR DE ADAPTABILIDAD "SOFIA SMART-LEVEL"
    let levelRules = '';
    
    if (gradeNumber >= 1 && gradeNumber <= 3 && isPrimary) {
      // NIVEL 1: Exploradores (1º a 3º Primaria)
      levelRules = `
📋 NIVEL: EXPLORADORES (1º-3º Primaria)

REGLA CRÍTICA DE LONGITUD:
- MÁXIMO 40 palabras por respuesta
- Formato: Texto grande, párrafos de UNA sola oración
- Emojis: MÍNIMO 3 por respuesta (obligatorio)

TONO:
- Mágico, simple, MUY entusiasta
- Como un personaje de caricatura preescolar
- Lenguaje extremadamente simple

ESTRUCTURA OBLIGATORIA:
1. Respuesta directa y muy simple
2. Pregunta divertida para seguir jugando

EJEMPLO:
"¡Hola! 🌟 La lluvia cae porque las nubes están llenas de agua, como una esponja mojada 🧽. ¿Te gusta saltar en los charcos? 🌧️"`;
      
    } else if (gradeNumber >= 4 && gradeNumber <= 6 && isPrimary) {
      // NIVEL 2: Descubridores (4º a 6º Primaria)
      levelRules = `
📋 NIVEL: DESCUBRIDORES (4º-6º Primaria)

REGLA CRÍTICA DE LONGITUD:
- MÁXIMO 80 palabras por respuesta
- Formato: Puede usar listas cortas (bullets)
- Emojis: Moderados (2-3 por respuesta)

TONO:
- Curioso, de compañero de equipo
- Explica el "por qué" de las cosas
- Uso de datos curiosos ("¿Sabías que...?")

ESTRUCTURA:
- Introduce el concepto
- Desarrolla con datos interesantes
- Cierra con pregunta o reflexión

EJEMPLO:
"El ciclo del agua es increíble. El sol calienta el mar y el agua sube al cielo como vapor. Luego se enfría, forma nubes y llueve. 🌧️ ¡Es como un reciclaje infinito de la naturaleza!"`;
      
    } else {
      // NIVEL 3: Inventores (Secundaria)
      levelRules = `
📋 NIVEL: INVENTORES (Secundaria)

REGLA DE LONGITUD:
- Adaptable (100-150 palabras), pero siempre escaneable
- Formato: Usa **negritas** para conceptos clave
- Usa listas numeradas para pasos
- Emojis: Estratégicos, no infantiles

TONO:
- Mentor "cool", tecnológico, retador
- Lenguaje más técnico pero accesible
- Referencias a cultura actual cuando sea relevante

ESTRUCTURA:
1. Introducción (contexto)
2. Desarrollo (puntos clave con negritas)
3. Conclusión rápida

RETO:
- Invita a pensar más allá ("¿Qué pasaría si...?")
- Conecta con aplicaciones del mundo real`;
    }

    // GUARDRAILS CURRICULARES
    const contentGuardrails = `
🚦 GUARDRAILS CURRICULARES (SEMÁFORO DE TEMAS):

TEMAS SENSIBLES y GRADOS APROPIADOS según SEP:
- Sexualidad/Reproducción humana: A partir de 4º Primaria
- Política compleja/Gobierno: A partir de 5º Primaria
- Violencia histórica detallada: A partir de 6º Primaria
- Educación financiera: A partir de 5º Primaria

PROTOCOLO DE DESVÍO EDUCATIVO:
Si el tema es sensible Y el estudiante está DEBAJO del grado apropiado:
- NUNCA digas: "No te puedo responder" o "Eres muy pequeño"
- DI: "¡Esa es una gran pregunta de [materia]! Es un tema muy interesante que estudiarás a fondo cuando llegues a **[GRADO]**, porque para entenderlo primero necesitas saber [CONCEPTO PREVIO]. Por ahora, ¿qué te parece si vemos [ALTERNATIVA APROPIADA]?"

EJEMPLO:
Niño de 1º pregunta sobre bebés → "¡Esa es una gran pregunta de biología! 🧬 Es un tema muy interesante que estudiarás a fondo cuando llegues a **4º de Primaria**, porque para entenderlo primero necesitas saber cómo funcionan las células. Por ahora, ¿qué te parece si vemos cómo nacen las plantas o los pollitos? 🌱🐣"`;

    const modeInstructions = {
      tutor: `Estás en modo TUTOR. Tu objetivo es ayudar con tareas y materias escolares.
      - Si piden que hagas la tarea completa, di: "¡Mejor lo hacemos juntos! ¿Qué tal si tú empiezas y yo te ayudo?"
      - Usa los contenidos de los Libros de la SEP de México como referencia principal.
      - Explica paso a paso, verificando que entienda antes de avanzar.`,
      exam: `Estás en modo PREPARACIÓN PARA EXAMEN. Tu objetivo es ayudar al estudiante a repasar cualquier tema de sus libros.
      - Pregunta primero qué tema o materia quiere estudiar
      - Usa los Libros de Texto Gratuitos de la SEP como referencia principal
      - Genera preguntas de repaso sobre el tema para verificar comprensión
      - Explica conceptos clave de manera clara y estructurada
      - Ofrece ejercicios prácticos similares a los que podrían venir en el examen
      - Al final, resume los puntos más importantes del tema`,
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
- Grado: ${gradeLabels[profile.grade] || 'primaria'} (${profile.grade})

${levelRules}

${contentGuardrails}

MODO ACTUAL: ${modes[currentMode].label}
${modeInstructions[currentMode]}

PERSONALIDAD BASE:
- Eres curioso, paciente y siempre usas lenguaje positivo
- Nunca regañas ni haces sentir mal al estudiante
- Siempre fomenta valores positivos

⚠️ REGLAS ABSOLUTAMENTE CRÍTICAS — NUNCA VIOLAR:
- RESPETA ESTRICTAMENTE los límites de palabras de tu nivel
- USA los emojis según lo especificado en tu nivel
- APLICA el protocolo de desvío educativo para temas sensibles
- JAMÁS menciones que tienes acceso a internet, buscadores web, o fuentes en línea
- JAMÁS cites URLs, links, páginas web, ni des indicaciones de "visita tal sitio"
- JAMÁS digas frases como "según internet", "puedes buscar en Google", "encontré en línea", "de acuerdo a fuentes web", "según la web" o similares
- JAMÁS menciones información sobre eventos, noticias o cambios ocurridos después de principios de 2026
- Si no sabes algo o el tema es posterior a principios de 2026, di honestamente: "Eso está fuera de lo que conozco por ahora 😅 Pero puedo ayudarte con lo que sé"
- Todo tu conocimiento proviene de tu entrenamiento interno, NO de búsquedas en tiempo real
- Presenta SIEMPRE tu información como conocimiento propio, sin atribuirla a fuentes externas ni a internet`;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      toast.info('Subiendo imagen... 📸');
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedImage(file_url);
      
      toast.success('¡Imagen subida! Ahora dime qué necesitas resolver');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error al subir la imagen. Intenta de nuevo.');
    }
  };

  const handleSend = async (message) => {
    // Verificar límite en modo invitado
    if (isGuestMode && guestQuestionCount >= 3) {
      toast.error('¡Se acabó tu prueba gratuita! 🎉', {
        description: 'Elige tu rol para continuar aprendiendo sin límites',
        duration: 5000,
        action: {
          label: 'Empezar ahora',
          onClick: () => navigate(createPageUrl('Home'))
        }
      });
      return;
    }

    const userMessage = { role: 'user', content: message };
    
    // Si hay una imagen y es modo tarea, agregarla al mensaje
    if (uploadedImage && homeworkMode) {
      userMessage.image = uploadedImage;
      setMessages(prev => [...prev, { ...userMessage, content: `📷 *[Imagen de tarea]*\n\n${message}` }]);
    } else {
      setMessages(prev => [...prev, userMessage]);
    }
    
    setIsThinking(true);
    setAvatarState('thinking');
    
    if (isGuestMode) {
      setGuestQuestionCount(prev => prev + 1);
    }

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
        let fullPrompt = `${getSystemPrompt()}\n\nHistorial de conversación:\n${messages.map(m => `${m.role === 'user' ? profile?.display_name : profile?.companion_name}: ${m.content}`).join('\n')}\n\n${profile?.display_name}: ${message}\n\n${profile?.companion_name}:`;

        // Si hay imagen subida en modo tarea, agregar contexto especial
        if (uploadedImage && homeworkMode) {
          fullPrompt = `${getSystemPrompt()}\n\nMODO ESPECIAL: AYUDA CON TAREA ESCANEADA
El estudiante ha subido una foto de su tarea. Debes:
1. Analizar la imagen para identificar el ejercicio o problema
2. NO dar la respuesta directa, sino guiar al estudiante paso a paso
3. Hacer preguntas para verificar su comprensión
4. Celebrar cuando entienda cada paso

Pregunta del estudiante: ${message}\n\n${profile?.companion_name}:`;
        }

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: fullPrompt,
          add_context_from_internet: false,
          file_urls: uploadedImage && homeworkMode ? [uploadedImage] : undefined
        });

        const assistantMessage = { role: 'assistant', content: aiResponse };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Limpiar imagen después de usarla
        if (uploadedImage && homeworkMode) {
          setUploadedImage(null);
        }
        
        // Mostrar aviso después de la 3ra pregunta en modo invitado
        if (isGuestMode && guestQuestionCount === 2) {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: '¡Esta fue tu última pregunta gratuita! 🎁 Para seguir aprendiendo sin límites, elige tu rol y crea tu cuenta. ¡Te espero! ✨'
            }]);
          }, 2000);
        }
        
        // Auto-guardar para 1º-3º primaria (no en modo invitado)
        if (!needsManualSave && !isGuestMode) {
          await autoSaveConversation([...messages, userMessage, assistantMessage]);
        }
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

  const autoSaveConversation = async (msgs) => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth || !profile?.id) return;

      const conversationData = {
        student_id: profile.id,
        title: msgs.find(m => m.role === 'user')?.content.substring(0, 50) || 'Conversación',
        mode: currentMode,
        subject: currentMode === 'tutor' ? 'general' : null,
        messages: msgs,
        topics_covered: []
      };

      if (currentConversationId) {
        await base44.entities.Conversation.update(currentConversationId, conversationData);
      } else {
        const newConv = await base44.entities.Conversation.create(conversationData);
        setCurrentConversationId(newConv.id);
      }
    } catch (error) {
      console.error('Error auto-saving:', error);
    }
  };

  const handleManualSave = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        toast.error('Debes crear una cuenta para guardar conversaciones', {
          description: 'Haz clic aquí para crear tu cuenta',
          action: {
            label: 'Crear cuenta',
            onClick: () => base44.auth.redirectToLogin(window.location.href)
          }
        });
        return;
      }

      // Verificar que tengamos el ID del perfil en base de datos
      if (!profile?.id) {
        // Recargar perfil de la base de datos
        const user = await base44.auth.me();
        const profiles = await base44.entities.StudentProfile.filter({ created_by: user.email });
        
        if (profiles.length === 0) {
          toast.error('No se encontró tu perfil. Intenta recargar la página.');
          return;
        }
        
        setProfile(profiles[0]);
        toast.info('Reintenta guardar ahora');
        return;
      }

      const conversationData = {
        student_id: profile.id,
        title: messages.find(m => m.role === 'user')?.content.substring(0, 50) || 'Conversación',
        mode: currentMode,
        subject: currentMode === 'tutor' || currentMode === 'exam' ? 'general' : null,
        messages: messages,
        topics_covered: []
      };

      if (currentConversationId) {
        await base44.entities.Conversation.update(currentConversationId, conversationData);
        toast.success('Conversación actualizada ✓');
      } else {
        const newConv = await base44.entities.Conversation.create(conversationData);
        setCurrentConversationId(newConv.id);
        toast.success('Conversación guardada ✓');
      }
    } catch (error) {
      console.error('Error completo:', error);
      toast.error(`Error al guardar: ${error.message || 'Intenta de nuevo'}`);
    }
  };

  const loadConversationFromURL = async () => {
    const params = new URLSearchParams(window.location.search);
    const conversationId = params.get('conversationId');
    const modeParam = params.get('mode');
    
    if (modeParam && modes[modeParam]) {
      setCurrentMode(modeParam);
    }
    
    if (conversationId) {
      try {
        const conversations = await base44.entities.Conversation.filter({ id: conversationId });
        if (conversations.length > 0) {
          const conv = conversations[0];
          setCurrentConversationId(conv.id);
          setMessages(conv.messages || []);
          setCurrentMode(conv.mode || 'tutor');
          toast.success('Conversación cargada ✓');
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
        toast.error('No se pudo cargar la conversación');
      }
    }
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    setAvatarState(isListening ? 'idle' : 'listening');
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
              onClick={() => navigate(isGuestMode ? createPageUrl('Home') : createPageUrl('Dashboard'))}
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

          {/* Mode selector & Save */}
          <div className="flex gap-2">
            {isGuestMode && (
              <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 flex items-center gap-2">
                <span className="text-sm font-bold text-amber-700">
                  {3 - guestQuestionCount} preguntas restantes
                </span>
              </div>
            )}
            {needsManualSave && messages.length > 1 && !isGuestMode && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleManualSave}
                className="rounded-full"
                title="Guardar conversación"
              >
                <Save className="w-4 h-4" />
              </Button>
            )}
            
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
          {/* Homework Mode: Upload Section */}
          {homeworkMode && !uploadedImage && messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-3xl p-8 border-2 border-dashed border-sky-300"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 mx-auto bg-gradient-to-br from-sky-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl"
                >
                  <span className="text-5xl">📸</span>
                </motion.div>
                
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    Sube tu tarea
                  </h3>
                  <p className="text-slate-600">
                    Toma una foto clara del ejercicio o problema que necesitas resolver
                  </p>
                </div>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 rounded-full px-8 py-6 text-lg shadow-lg"
                >
                  📷 Tomar foto / Subir imagen
                </Button>
              </div>
            </motion.div>
          )}

          {/* Preview uploaded image */}
          {uploadedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-4 border-2 border-green-200 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-green-800 mb-2">Imagen lista</p>
                  <img 
                    src={uploadedImage} 
                    alt="Tarea subida" 
                    className="w-full max-w-md rounded-xl border border-slate-200"
                  />
                  <p className="text-sm text-slate-600 mt-2">
                    Ahora escribe qué parte necesitas que te ayude a resolver
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setUploadedImage(null)}
                  className="text-slate-400 hover:text-red-500"
                >
                  ✕
                </Button>
              </div>
            </motion.div>
          )}
          
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
                companionPersonality={profile.companion_personality}
                autoPlayVoice={autoPlayVoice && msg.role === 'assistant' && i === messages.length - 1}
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
      <div className="relative">
        {homeworkMode && !uploadedImage && (
          <div className="max-w-4xl mx-auto px-4 pb-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full rounded-2xl py-6 border-2 border-dashed border-sky-300 hover:border-sky-500 hover:bg-sky-50 transition-all"
            >
              <span className="text-lg">📷 Subir foto de tu tarea</span>
            </Button>
          </div>
        )}
        
        <ChatInput
          onSend={handleSend}
          onVoiceToggle={toggleVoice}
          isListening={isListening}
          disabled={isThinking}
          placeholder={homeworkMode && uploadedImage ? "¿Qué parte necesitas resolver?" : `Escribe a ${profile.companion_name}...`}
        />
      </div>
    </div>
  );
}