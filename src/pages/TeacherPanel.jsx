import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Users, Trophy, CheckCircle, XCircle, Clock, Coins, Target } from 'lucide-react';

import ClassroomCard from '@/components/teacher/ClassroomCard';
import ProofOfLearningList from '@/components/teacher/ProofOfLearningList';
import CreateClassroomModal from '@/components/teacher/CreateClassroomModal';
import ClassroomGoalCard from '@/components/teacher/ClassroomGoalCard';

export default function TeacherPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [activeTab, setActiveTab] = useState('classrooms');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);
      const [cls, prf] = await Promise.all([
        base44.entities.Classroom.filter({ teacher_email: me.email }),
        base44.entities.ProofOfLearning.filter({ teacher_email: me.email }, '-created_date', 50)
      ]);
      setClassrooms(cls);
      setProofs(prf);
    } catch (e) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProof = async (proof) => {
    await base44.entities.ProofOfLearning.update(proof.id, { status: 'approved' });
    // Sumar tokens al ledger del alumno
    const ledgers = await base44.entities.TokenLedger.filter({ student_id: proof.student_id });
    if (ledgers.length > 0) {
      const l = ledgers[0];
      await base44.entities.TokenLedger.update(l.id, {
        total_tokens: (l.total_tokens || 0) + proof.tokens_earned,
        approved_tokens: (l.approved_tokens || 0) + proof.tokens_earned,
        pending_tokens: Math.max(0, (l.pending_tokens || 0) - proof.tokens_earned),
        last_earn_date: new Date().toISOString().split('T')[0]
      });
    }
    // Sumar al total del salón
    if (proof.classroom_id) {
      const cls = classrooms.find(c => c.id === proof.classroom_id);
      if (cls) {
        const newTotal = (cls.current_tokens || 0) + proof.tokens_earned;
        await base44.entities.Classroom.update(cls.id, {
          current_tokens: newTotal,
          goal_reached: newTotal >= cls.token_goal
        });
      }
    }
    toast.success(`✅ Aprobado — +${proof.tokens_earned} SofiaCoins para ${proof.student_name}`);
    loadData();
  };

  const handleRejectProof = async (proof) => {
    await base44.entities.ProofOfLearning.update(proof.id, { status: 'rejected' });
    const ledgers = await base44.entities.TokenLedger.filter({ student_id: proof.student_id });
    if (ledgers.length > 0) {
      const l = ledgers[0];
      await base44.entities.TokenLedger.update(l.id, {
        pending_tokens: Math.max(0, (l.pending_tokens || 0) - proof.tokens_earned)
      });
    }
    toast.error(`❌ Rechazado — tokens no otorgados`);
    loadData();
  };

  const tabs = [
    { id: 'classrooms', label: 'Mis Salones', icon: Users },
    { id: 'proofs', label: 'Proof of Learning', icon: Trophy, badge: proofs.filter(p => p.status === 'pending').length },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-slate-800 text-lg">Panel del Maestro</h1>
              <p className="text-xs text-slate-500">{user?.full_name || user?.email}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo Salón
          </Button>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 pb-3 flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'classrooms' && (
          <>
            {classrooms.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🏫</div>
                <h2 className="text-xl font-bold text-slate-700 mb-2">Aún no tienes salones</h2>
                <p className="text-slate-500 mb-6">Crea tu primer salón y comparte el código con tus alumnos</p>
                <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl">
                  <Plus className="w-4 h-4 mr-2" /> Crear primer salón
                </Button>
              </motion.div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {classrooms.map(cls => (
                  <div key={cls.id} className="space-y-3">
                    <ClassroomCard classroom={cls} />
                    <ClassroomGoalCard classroom={cls} onUpdate={loadData} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'proofs' && (
          <ProofOfLearningList
            proofs={proofs}
            onApprove={handleApproveProof}
            onReject={handleRejectProof}
          />
        )}
      </main>

      {showCreateModal && (
        <CreateClassroomModal
          teacherEmail={user?.email}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); loadData(); }}
        />
      )}
    </div>
  );
}