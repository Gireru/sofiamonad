import React from 'react';
import { motion } from 'framer-motion';
import { Send, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MissionHistory({ missions }) {
  if (missions.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-600 text-sm flex items-center gap-2">
        <Clock className="w-4 h-4" /> Misiones enviadas
      </h3>
      {missions.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-emerald-50 border border-emerald-100 rounded-xl p-3"
        >
          <p className="text-sm text-slate-700 mb-2">{m.text}</p>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {m.student_count || 0} alumnos
            </span>
            <span>{format(new Date(m.created_date), "d MMM, HH:mm", { locale: es })}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}