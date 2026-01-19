import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen } from 'lucide-react';

const grades = [
  { id: '1_primaria', label: '1° Primaria', emoji: '🌱', level: 'primaria' },
  { id: '2_primaria', label: '2° Primaria', emoji: '🌿', level: 'primaria' },
  { id: '3_primaria', label: '3° Primaria', emoji: '🌳', level: 'primaria' },
  { id: '4_primaria', label: '4° Primaria', emoji: '⭐', level: 'primaria' },
  { id: '5_primaria', label: '5° Primaria', emoji: '🚀', level: 'primaria' },
  { id: '6_primaria', label: '6° Primaria', emoji: '🎯', level: 'primaria' },
  { id: '1_secundaria', label: '1° Secundaria', emoji: '🔬', level: 'secundaria' },
  { id: '2_secundaria', label: '2° Secundaria', emoji: '🔭', level: 'secundaria' },
  { id: '3_secundaria', label: '3° Secundaria', emoji: '🎓', level: 'secundaria' },
];

export default function GradeSelector({ selected, onSelect }) {
  const primaria = grades.filter(g => g.level === 'primaria');
  const secundaria = grades.filter(g => g.level === 'secundaria');

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">
          ¿En qué grado estás? 📚
        </h2>
        <p className="text-slate-500">
          Así tu compañero sabrá cómo ayudarte mejor
        </p>
      </div>

      {/* Primaria */}
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-600">Primaria</span>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {primaria.map((grade) => (
            <motion.button
              key={grade.id}
              onClick={() => onSelect(grade.id)}
              className={`
                p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1
                ${selected === grade.id 
                  ? 'border-green-400 bg-green-50 shadow-lg shadow-green-200/50' 
                  : 'border-slate-200 bg-white/60 hover:border-green-300 hover:bg-green-50/50'}
              `}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl">{grade.emoji}</span>
              <span className={`text-sm font-medium ${selected === grade.id ? 'text-green-600' : 'text-slate-600'}`}>
                {grade.label.split(' ')[0]}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Secundaria */}
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-600">Secundaria</span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {secundaria.map((grade) => (
            <motion.button
              key={grade.id}
              onClick={() => onSelect(grade.id)}
              className={`
                p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                ${selected === grade.id 
                  ? 'border-blue-400 bg-blue-50 shadow-lg shadow-blue-200/50' 
                  : 'border-slate-200 bg-white/60 hover:border-blue-300 hover:bg-blue-50/50'}
              `}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl">{grade.emoji}</span>
              <span className={`text-sm font-medium ${selected === grade.id ? 'text-blue-600' : 'text-slate-600'}`}>
                {grade.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}