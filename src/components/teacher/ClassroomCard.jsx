import React from 'react';
import { motion } from 'framer-motion';
import { Users, Copy } from 'lucide-react';
import { toast } from 'sonner';

const gradeLabels = {
  '1_primaria': '1° Primaria', '2_primaria': '2° Primaria',
  '3_primaria': '3° Primaria', '4_primaria': '4° Primaria',
  '5_primaria': '5° Primaria', '6_primaria': '6° Primaria',
  '1_secundaria': '1° Secundaria', '2_secundaria': '2° Secundaria',
  '3_secundaria': '3° Secundaria'
};

export default function ClassroomCard({ classroom }) {
  const copyCode = () => {
    navigator.clipboard.writeText(classroom.join_code);
    toast.success('Código copiado 📋');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{classroom.name}</h3>
          <p className="text-slate-500 text-sm">{classroom.school}</p>
          <p className="text-indigo-600 text-xs font-medium">{gradeLabels[classroom.grade]}</p>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-sm bg-slate-50 px-3 py-1 rounded-xl">
          <Users className="w-4 h-4" />
          {classroom.student_count || 0} alumnos
        </div>
      </div>

      <button
        onClick={copyCode}
        className="w-full flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 transition-colors rounded-xl px-4 py-3"
      >
        <div className="text-left">
          <p className="text-xs text-indigo-500 font-medium">Código de acceso</p>
          <p className="font-mono font-bold text-indigo-700 text-lg tracking-widest">{classroom.join_code}</p>
        </div>
        <Copy className="w-5 h-5 text-indigo-400" />
      </button>
    </motion.div>
  );
}