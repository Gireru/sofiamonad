import { useState, useRef, useCallback } from 'react';

const MODEL_ID = 'gemma-2-2b-it-q4f16_1-MLC';
const STORAGE_KEY = 'sofia_local_llm_ready';

export function useLocalLLM() {
  const [status, setStatus] = useState(() => {
    // Check if previously downloaded (cached in IndexedDB by WebLLM)
    return localStorage.getItem(STORAGE_KEY) === 'true' ? 'loading' : 'idle';
  });
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const engineRef = useRef(null);

  const initEngine = useCallback(async () => {
    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
      
      setStatus('downloading');
      setProgress(0);

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
      console.error('WebLLM error:', err);
      localStorage.removeItem(STORAGE_KEY);
      setStatus('error');
    }
  }, []);

  const download = useCallback(() => {
    if (status === 'idle' || status === 'error') {
      initEngine();
    }
  }, [status, initEngine]);

  // Auto-load if was previously downloaded
  const autoLoad = useCallback(() => {
    if (status === 'loading') {
      initEngine();
    }
  }, [status, initEngine]);

  const generate = useCallback(async (systemPrompt, conversationHistory, userMessage) => {
    if (!engineRef.current) return null;
    
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: userMessage }
    ];

    const reply = await engineRef.current.chat.completions.create({
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 300,
    });

    return reply.choices[0].message.content;
  }, []);

  return { status, progress, progressText, download, autoLoad, generate };
}