import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Genera un hash simple para el certificado (blockchain-ready)
function generateHash(data) {
  const str = JSON.stringify(data) + Date.now();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0') + 
         Math.abs(hash * 31).toString(16).padStart(8, '0') +
         Math.abs(hash * 17).toString(16).padStart(8, '0') +
         Math.abs(hash * 7).toString(16).padStart(8, '0');
}

export default function ProofOfLearningButton({ profile, messages, currentMode }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleEvaluate = async () => {
    if (messages.length < 4) {
      toast.error('Necesitas al menos 2 intercambios de preguntas para generar un Proof of Learning');
      return;
    }
    setLoading(true);

    try {
      const conversationText = messages
        .slice(-12)
        .map(m => `${m.role === 'user' ? profile.display_name : 'Sofia'}: ${m.content}`)
        .join('\n');

      // La IA evalúa si realmente hubo aprendizaje
      const evaluation = await base44.integrations.Core.InvokeLLM({
        prompt: `Eres un evaluador educativo experto. Analiza esta conversación entre un alumno de ${profile.grade} y Sofia (IA tutora).

CONVERSACIÓN:
${conversationText}

Evalúa si el alumno demostró aprendizaje real. Responde SOLO con este JSON:
{
  "learned": true/false,
  "topic": "tema principal aprendido (máx 5 palabras)",
  "subject": "materia (matematicas/espanol/ciencias/historia/geografia/civica/arte/general)",
  "score": número del 0 al 100,
  "tokens_earned": número entre 10 y 100 (proporcional al score),
  "evaluation": "explicación breve de qué aprendió el alumno (máx 2 oraciones)"
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            learned: { type: 'boolean' },
            topic: { type: 'string' },
            subject: { type: 'string' },
            score: { type: 'number' },
            tokens_earned: { type: 'number' },
            evaluation: { type: 'string' }
          }
        }
      });

      if (!evaluation.learned || evaluation.score < 30) {
        toast.info('La IA detectó que aún necesitas estudiar más este tema. ¡Sigue intentando! 💪');
        setLoading(false);
        return;
      }

      const certHash = generateHash({ student: profile.id, topic: evaluation.topic, score: evaluation.score });

      // Guardar Proof of Learning
      const proof = await base44.entities.ProofOfLearning.create({
        student_id: profile.id,
        student_name: profile.display_name,
        classroom_id: profile.classroom_id || null,
        teacher_email: profile.teacher_email || null,
        subject: evaluation.subject,
        topic: evaluation.topic,
        grade: profile.grade,
        tokens_earned: evaluation.tokens_earned,
        ai_evaluation: evaluation.evaluation,
        ai_score: evaluation.score,
        status: 'pending',
        certificate_hash: certHash,
      });

      // Actualizar ledger del alumno (tokens pendientes)
      const ledgers = await base44.entities.TokenLedger.filter({ student_id: profile.id });
      if (ledgers.length > 0) {
        const l = ledgers[0];
        await base44.entities.TokenLedger.update(l.id, {
          total_tokens: (l.total_tokens || 0) + evaluation.tokens_earned,
          pending_tokens: (l.pending_tokens || 0) + evaluation.tokens_earned,
          last_earn_date: new Date().toISOString().split('T')[0]
        });
      } else {
        await base44.entities.TokenLedger.create({
          student_id: profile.id,
          student_name: profile.display_name,
          total_tokens: evaluation.tokens_earned,
          pending_tokens: evaluation.tokens_earned,
          approved_tokens: 0,
          classroom_id: profile.classroom_id || null,
          teacher_email: profile.teacher_email || null,
          last_earn_date: new Date().toISOString().split('T')[0],
          blockchain_hash: certHash,
        });
      }

      setResult({ ...evaluation, certHash });
      toast.success(`🎉 +${evaluation.tokens_earned} SofiaCoins ganados! Pendiente de aprobación del maestro.`);
    } catch (e) {
      console.error(e);
      toast.error('Error al evaluar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (currentMode === 'free') return null;

  return (
    <div className="px-4 pb-2">
      <AnimatePresence>
        {result ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-amber-800">🏅 Proof of Learning generado</p>
              <p className="text-sm text-amber-600">{result.topic} · +{result.tokens_earned} SofiaCoins</p>
              <p className="text-xs text-slate-400 font-mono mt-1">{result.certHash?.slice(0, 16)}...</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-amber-600">{result.score}</p>
              <p className="text-xs text-amber-500">/100</p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button
              onClick={handleEvaluate}
              disabled={loading || messages.length < 4}
              variant="outline"
              className="w-full rounded-2xl border-amber-200 text-amber-700 hover:bg-amber-50 gap-2 py-5"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Evaluando con IA...</>
              ) : (
                <><Trophy className="w-4 h-4" /> Generar Proof of Learning 🪙</>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}