import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Coins, Trophy, Star, Shield, Hash } from 'lucide-react';
import ClassroomProgress from '@/components/gamification/ClassroomProgress';

export default function TokenWallet() {
  const navigate = useNavigate();
  const [ledger, setLedger] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [classroom, setClassroom] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const local = localStorage.getItem('sofia_profile');
      if (!local) { navigate('/'); return; }
      const p = JSON.parse(local);
      setProfile(p);

      const [ledgers, prf] = await Promise.all([
        base44.entities.TokenLedger.filter({ student_id: p.id }),
        base44.entities.ProofOfLearning.filter({ student_id: p.id }, '-created_date', 20)
      ]);

      setLedger(ledgers[0] || null);
      setProofs(prf);

      if (ledgers[0]?.classroom_id) {
        const cls = await base44.entities.Classroom.filter({ id: ledgers[0].classroom_id });
        setClassroom(cls[0] || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const total = ledger?.total_tokens || 0;
  const pending = ledger?.pending_tokens || 0;
  const approved = ledger?.approved_tokens || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-slate-800">Mi Wallet Sofia</h1>
            <p className="text-xs text-slate-500">Tus SofiaCoins y certificados</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Balance principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🪙</span>
            </div>
            <div>
              <p className="text-amber-100 text-sm">SofiaCoins totales</p>
              <p className="text-4xl font-black">{total.toLocaleString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 rounded-2xl p-3">
              <p className="text-amber-100 text-xs">✅ Aprobados</p>
              <p className="text-2xl font-bold">{approved.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3">
              <p className="text-amber-100 text-xs">⏳ Pendientes</p>
              <p className="text-2xl font-bold">{pending.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Progreso del salón */}
        {classroom && <ClassroomProgress classroom={classroom} />}

        {/* Mis certificados */}
        <div>
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> Mis Proof of Learning
          </h2>
          {proofs.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-400">
              <div className="text-4xl mb-2">📚</div>
              <p>Aún no tienes certificados. ¡Estudia con Sofia y gana tokens!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proofs.map((proof, i) => (
                <motion.div
                  key={proof.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 flex items-start justify-between shadow-sm border border-slate-100"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                      proof.status === 'approved' ? 'bg-green-100' :
                      proof.status === 'pending' ? 'bg-amber-100' :
                      proof.status === 'rejected' ? 'bg-red-100' : 'bg-purple-100'
                    }`}>
                      {proof.status === 'approved' ? '✅' :
                       proof.status === 'pending' ? '⏳' :
                       proof.status === 'rejected' ? '❌' : '🔗'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{proof.topic}</p>
                      <p className="text-xs text-slate-500">{proof.subject} · {proof.grade}</p>
                      {proof.ai_score && (
                        <p className="text-xs text-indigo-600 font-medium">Puntaje IA: {proof.ai_score}/100</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600">+{proof.tokens_earned} 🪙</p>
                    {proof.certificate_hash && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Hash className="w-3 h-3" />
                        {proof.certificate_hash.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}