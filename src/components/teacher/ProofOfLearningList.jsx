import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: '⏳' },
  approved: { label: 'Aprobado', color: 'bg-green-100 text-green-700', icon: '✅' },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: '❌' },
  minted: { label: 'En Blockchain', color: 'bg-purple-100 text-purple-700', icon: '🔗' },
};

export default function ProofOfLearningList({ proofs, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(null);
  const pending = proofs.filter(p => p.status === 'pending');
  const others = proofs.filter(p => p.status !== 'pending');

  const ProofCard = ({ proof }) => {
    const cfg = statusConfig[proof.status] || statusConfig.pending;
    const isOpen = expanded === proof.id;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div
          className="p-4 flex items-start justify-between cursor-pointer"
          onClick={() => setExpanded(isOpen ? null : proof.id)}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{cfg.icon}</span>
            <div>
              <p className="font-bold text-slate-800">{proof.student_name}</p>
              <p className="text-sm text-slate-600">{proof.topic} · {proof.subject}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                {proof.ai_score && (
                  <span className="text-xs text-indigo-600 flex items-center gap-1">
                    <Star className="w-3 h-3" /> {proof.ai_score}/100
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-600">+{proof.tokens_earned} 🪙</span>
            {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-slate-100"
            >
              <div className="p-4 space-y-3 bg-slate-50">
                {proof.ai_evaluation && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">📊 Evaluación de la IA</p>
                    <p className="text-sm text-slate-700 bg-white rounded-xl p-3">{proof.ai_evaluation}</p>
                  </div>
                )}
                {proof.certificate_hash && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">🔐 Hash del certificado</p>
                    <p className="font-mono text-xs text-slate-600 bg-white rounded-xl p-2 break-all">{proof.certificate_hash}</p>
                  </div>
                )}
                {proof.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onApprove(proof)}
                      className="flex-1 bg-green-500 hover:bg-green-600 rounded-xl gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Aprobar
                    </Button>
                    <Button
                      onClick={() => onReject(proof)}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Rechazar
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            Pendientes de revisión ({pending.length})
          </h3>
          <div className="space-y-3">{pending.map(p => <ProofCard key={p.id} proof={p} />)}</div>
        </div>
      )}
      {others.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-700 mb-3">Historial</h3>
          <div className="space-y-3">{others.map(p => <ProofCard key={p.id} proof={p} />)}</div>
        </div>
      )}
      {proofs.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">🏅</div>
          <p>Aún no hay Proof of Learning para revisar</p>
        </div>
      )}
    </div>
  );
}