import { useState, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Qwen2.5-0.5B: ~300MB cuantizado, funciona via WebAssembly en todos los dispositivos
const MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct';
const STORAGE_KEY = 'sofia_llm_downloaded_v2';

// Prompt base que siempre se inyecta — define la identidad y reglas de Sofia
const BASE_SYSTEM_PROMPT = `Eres Sofia, una compañera de estudio virtual amigable y segura diseñada exclusivamente para niños de primaria y secundaria en México (6 a 15 años).

IDENTIDAD:
- Eres paciente, entusiasta, positiva y nunca regañas
- Usas lenguaje simple, claro y apropiado para niños
- Siempre fomentas valores: respeto, esfuerzo, curiosidad y honestidad
- Nunca produces contenido violento, sexual, aterrador ni inapropiado para menores

RESTRICCIONES ABSOLUTAS (nunca violar):
- JAMÁS generes contenido para adultos, violento, de odio o peligroso
- JAMÁS proporciones información personal de nadie
- JAMÁS incentives conductas dañinas, bullying o discriminación
- JAMÁS menciones redes sociales, apps de citas, apuestas ni alcohol/drogas
- Si el tema no es apropiado para niños, redirige amablemente a temas educativos
- Si detectas que el niño está triste, asustado o en peligro, responde con empatía y sugiere hablar con un adulto de confianza

ESTILO:
- Respuestas cortas y visuales (usa emojis con moderación)
- Celebra los logros del niño con entusiasmo
- Cuando no sepas algo, dilo honestamente: "No lo sé con certeza 😅"
- Usa los libros de texto de la SEP de México como referencia principal

Estás aquí para ayudar a los niños a aprender y crecer de forma segura. 🌟`;

export function useLocalLLM() {
  const [status, setStatus] = useState('idle'); // idle | downloading | loading | ready | error
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const pipelineRef = useRef(null);
  const initStarted = useRef(false);

  const initEngine = useCallback(async () => {
    if (initStarted.current) return;
    initStarted.current = true;

    const alreadyDownloaded = localStorage.getItem(STORAGE_KEY) === 'true';
    setStatus(alreadyDownloaded ? 'loading' : 'downloading');
    setProgress(0);

    try {
      const { pipeline } = await import('@huggingface/transformers');

      const generator = await pipeline('text-generation', MODEL_ID, {
        dtype: 'q4',
        progress_callback: (info) => {
          if (info.status === 'progress' && info.total > 0) {
            const pct = Math.round((info.loaded / info.total) * 100);
            setProgress(pct);
            setProgressText(`Descargando modelo... ${pct}%`);
          } else if (info.status === 'ready') {
            setStatus('loading');
            setProgressText('Iniciando Sofia...');
            setProgress(95);
          }
        },
      });

      pipelineRef.current = generator;
      localStorage.setItem(STORAGE_KEY, 'true');
      setStatus('ready');
      setProgress(100);
      setProgressText('¡Lista!');
    } catch (err) {
      console.error('LLM local falló, usando nube:', err);
      localStorage.removeItem(STORAGE_KEY);
      // Fallback silencioso a la nube
      pipelineRef.current = null;
      setStatus('ready');
      setProgress(100);
      setProgressText('Usando IA en la nube');
    }
  }, []);

  useEffect(() => {
    initEngine();
  }, []);

  const retry = useCallback(() => {
    initStarted.current = false;
    pipelineRef.current = null;
    localStorage.removeItem(STORAGE_KEY);
    setStatus('idle');
    setProgress(0);
    initEngine();
  }, [initEngine]);

  const generate = useCallback(async (systemPrompt, conversationHistory, userMessage) => {
    // Sin motor local → usar nube
    if (!pipelineRef.current) {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nHistorial reciente:\n${conversationHistory.slice(-6).map(m => `${m.role === 'user' ? 'Estudiante' : 'Sofia'}: ${m.content}`).join('\n')}\n\nEstudiante: ${userMessage}\n\nSofia:`,
      });
      return typeof response === 'string' ? response : response?.text || response?.response || String(response);
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    const output = await pipelineRef.current(messages, {
      max_new_tokens: 400,
      temperature: 0.7,
      do_sample: true,
    });

    return output[0].generated_text.at(-1).content;
  }, []);

  return { status, progress, progressText, retry, generate };
}