import { useState, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const MODEL_ID = 'gemma-2-2b-it-q4f16_1-MLC';
const STORAGE_KEY = 'sofia_local_llm_ready';

function hasWebGPU() {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

export function useLocalLLM() {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const engineRef = useRef(null);
  const useCloudRef = useRef(false);
  const initStarted = useRef(false);

  const initEngine = useCallback(async () => {
    if (initStarted.current) return;
    initStarted.current = true;

    // Si no hay WebGPU (Android, iOS, navegadores sin soporte), usar nube directamente
    if (!hasWebGPU()) {
      useCloudRef.current = true;
      setStatus('ready');
      setProgress(100);
      setProgressText('Usando IA en la nube');
      return;
    }

    try {
      const alreadyDownloaded = localStorage.getItem(STORAGE_KEY) === 'true';
      setStatus(alreadyDownloaded ? 'loading' : 'downloading');
      setProgress(0);

      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

      const engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report) => {
          const pct = Math.round(report.progress * 100);
          setProgress(pct);
          setProgressText(report.text || `Cargando... ${pct}%`);
        }
      });

      engineRef.current = engine;
      localStorage.setItem(STORAGE_KEY, 'true');
      setStatus('ready');
      setProgress(100);
    } catch (err) {
      console.error('WebLLM error, fallback a nube:', err);
      localStorage.removeItem(STORAGE_KEY);
      // Fallback a nube si falla la carga local
      useCloudRef.current = true;
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
    useCloudRef.current = false;
    engineRef.current = null;
    setStatus('idle');
    initEngine();
  }, [initEngine]);

  const generate = useCallback(async (systemPrompt, conversationHistory, userMessage) => {
    // Usar IA en la nube si no hay motor local
    if (!engineRef.current || useCloudRef.current) {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nHistorial reciente:\n${conversationHistory.slice(-6).map(m => `${m.role === 'user' ? 'Estudiante' : 'Sofia'}: ${m.content}`).join('\n')}\n\nEstudiante: ${userMessage}\n\nSofia:`,
      });
      return typeof response === 'string' ? response : response?.text || response?.response || '';
    }

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: userMessage }
    ];

    const reply = await engineRef.current.chat.completions.create({
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 400,
    });

    return reply.choices[0].message.content;
  }, []);

  return { status, progress, progressText, retry, generate };
}