import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Edit2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ClassroomGoalCard({ classroom, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [reward, setReward] = useState(classroom.goal_reward || '');
  const [goal, setGoal] = useState(classroom.token_goal || 10000);

  const progress = Math.min(100, Math.round(((classroom.current_tokens || 0) / (classroom.token_goal || 10000)) * 100));

  const saveGoal = async () => {
    await base44.entities.Classroom.update(classroom.id, { goal_reward: reward, token_goal: Number(goal) });
    toast.success('Meta actualizada ✅');
    setEditing(false);
    onUpdate();
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          <span className="font-bold text-slate-700">Meta del Salón</span>
        </div>
        <button onClick={() => setEditing(!editing)} className="text-purple-400 hover:text-purple-600">
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2 mb-3">
          <input
            value={reward}
            onChange={e => setReward(e.target.value)}
            placeholder="Recompensa (ej: Excursión a Fundidora)"
            className="w-full border border-purple-200 rounded-xl px-3 py-2 text-sm"
          />
          <input
            type="number"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="Meta de tokens"
            className="w-full border border-purple-200 rounded-xl px-3 py-2 text-sm"
          />
          <Button onClick={saveGoal} size="sm" className="w-full bg-purple-500 rounded-xl">
            <Check className="w-4 h-4 mr-1" /> Guardar
          </Button>
        </div>
      ) : (
        <p className="text-sm font-semibold text-purple-700 mb-3">
          🎯 {classroom.goal_reward || 'Sin recompensa definida'}
        </p>
      )}

      {/* Barra de progreso */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{(classroom.current_tokens || 0).toLocaleString()} SofiaCoins</span>
          <span>Meta: {(classroom.token_goal || 10000).toLocaleString()}</span>
        </div>
        <div className="w-full bg-purple-100 rounded-full h-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
          />
        </div>
        <p className="text-center text-xs font-bold text-purple-600">{progress}% completado</p>
      </div>

      {classroom.goal_reached && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-3 bg-green-100 rounded-xl p-3 text-center"
        >
          <p className="text-green-700 font-bold">🎉 ¡META ALCANZADA! El maestro debe aprobar la recompensa.</p>
        </motion.div>
      )}
    </div>
  );
}