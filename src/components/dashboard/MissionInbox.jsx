import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MissionInbox({ profile }) {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    const load = async () => {
      try {
        // Buscar el salón del alumno
        const memberships = await base44.entities.ClassroomMember.filter({ student_id: profile.id });
        if (memberships.length === 0) {
          // Si no tiene salón, buscar misiones por teacher_email si existe
          if (profile.teacher_email) {
            const ms = await base44.entities.Mission.filter({ teacher_email: profile.teacher_email }, '-created_date', 5);
            setMissions(ms);
          }
          return;
        }
        const classroomId = memberships[0].classroom_id;
        const ms = await base44.entities.Mission.filter({ classroom_id: classroomId }, '-created_date', 5);
        if (ms.length > 0) {
          setMissions(ms);
        } else {
          // fallback: buscar por teacher_email del salón
          const classrooms = await base44.entities.Classroom.filter({ id: classroomId });
          if (classrooms.length > 0) {
            const ms2 = await base44.entities.Mission.filter({ teacher_email: classrooms[0].teacher_email }, '-created_date', 5);
            setMissions(ms2);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [profile]);

  if (missions.length === 0) return null;

  const latest = missions[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 overflow-hidden"
    >
      {/* Banner principal */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow">
            <span className="text-xl">📨</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Tu profe mandó una misión</p>
            <p className="text-slate-700 font-medium text-sm line-clamp-1">{latest.text}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-emerald-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-emerald-100"
          >
            <div className="p-4 space-y-3">
              {missions.map((m, i) => (
                <div key={m.id} className={`rounded-xl p-3 ${i === 0 ? 'bg-emerald-100 border border-emerald-200' : 'bg-white border border-slate-100'}`}>
                  <p className="text-slate-700 text-sm mb-2">{m.text}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      {format(new Date(m.created_date), "d 'de' MMM, HH:mm", { locale: es })}
                    </p>
                    {i === 0 && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/Chat?mission=${encodeURIComponent(m.text)}`)}
                        className="bg-emerald-500 hover:bg-emerald-600 rounded-xl gap-1 text-xs"
                      >
                        <Sparkles className="w-3 h-3" /> ¡Aceptar misión!
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}