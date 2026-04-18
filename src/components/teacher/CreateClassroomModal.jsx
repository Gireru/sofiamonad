import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const grades = [
  { value: '1_primaria', label: '1° Primaria' }, { value: '2_primaria', label: '2° Primaria' },
  { value: '3_primaria', label: '3° Primaria' }, { value: '4_primaria', label: '4° Primaria' },
  { value: '5_primaria', label: '5° Primaria' }, { value: '6_primaria', label: '6° Primaria' },
  { value: '1_secundaria', label: '1° Secundaria' }, { value: '2_secundaria', label: '2° Secundaria' },
  { value: '3_secundaria', label: '3° Secundaria' },
];

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CreateClassroomModal({ teacherEmail, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', school: '', grade: '4_primaria', goal_reward: '', token_goal: 10000 });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.name || !form.school) { toast.error('Completa nombre y escuela'); return; }
    setSaving(true);
    const classroom = await base44.entities.Classroom.create({
      ...form,
      teacher_email: teacherEmail,
      join_code: generateCode(),
      current_tokens: 0,
      student_count: 0,
      goal_reached: false,
    });
    toast.success(`Salón "${form.name}" creado ✅`);
    onCreated(classroom);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-800">Nuevo Salón</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Nombre del grupo</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: 4to A, Grupo Azul"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Escuela</label>
            <input
              value={form.school}
              onChange={e => setForm({ ...form, school: e.target.value })}
              placeholder="Ej: Colegio Americano"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Grado</label>
            <select
              value={form.grade}
              onChange={e => setForm({ ...form, grade: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {grades.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">🎯 Recompensa grupal (opcional)</label>
            <input
              value={form.goal_reward}
              onChange={e => setForm({ ...form, goal_reward: e.target.value })}
              placeholder="Ej: Excursión a Fundidora"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Meta de SofiaCoins del grupo</label>
            <input
              type="number"
              value={form.token_goal}
              onChange={e => setForm({ ...form, token_goal: Number(e.target.value) })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        <Button
          onClick={handleCreate}
          disabled={saving}
          className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl py-6 text-base"
        >
          {saving ? 'Creando...' : '✅ Crear Salón'}
        </Button>
      </motion.div>
    </div>
  );
}