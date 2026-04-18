import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles, MessageCircle, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format, isAfter, subHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

// Palabras clave que indican que la misión es "chatear con la IA"
const CHAT_KEYWORDS = ['platicar', 'chatear', 'hablar', 'conversar', 'pregunta', 'preguntale', 'pregúntale', 'ia', 'sofia', 'chat', 'tutor'];

function isChatMission(text) {
  const lower = (text || '').toLowerCase();
  return CHAT_KEYWORDS.some(kw => lower.includes(kw));
}

export default function MissionInbox({ profile }) {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    if (!profile?.id) return;
    const load = async () => {
      try {
        // 1. Buscar misiones donde el alumno está en student_ids
        const directMissions = await base44.entities.Mission.filter({ student_ids: profile.id }, '-created_date', 10);
        if (directMissions.length > 0) {
          setMissions(directMissions);
          return;
        }

        // 2. Buscar por classroom
        const memberships = await base44.entities.ClassroomMember.filter({ student_id: profile.id });
        if (memberships.length > 0) {
          const classroomId = memberships[0].classroom_id;
          const ms = await base44.entities.Mission.filter({ classroom_id: classroomId }, '-created_date', 5);
          if (ms.length > 0) { setMissions(ms); return; }

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

  // Filtrar misiones que no hayan expirado (12 horas)
  const activeMissions = missions.filter(m => {
    const created = new Date(m.created_date);
    const expiry = new Date(created.getTime() + 12 * 60 * 60 * 1000);
    return new Date() < expiry;
  });

  if (activeMissions.length === 0) return null;

  const handleAccept = async (mission) => {
    // Dar 50 Monads al aceptar la misión
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.StudentProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        const invs = await base44.entities.StudentInventory.filter({ student_id: profiles[0].id });
        if (invs.length > 0) {
          await base44.entities.StudentInventory.update(invs[0].id, { neuronas: (invs[0].neuronas || 0) + 50 });
          toast.success('¡+50 Monads por aceptar la misión! 🪙');
        }
      }
    } catch (e) { console.error(e); }
    navigate(`/Chat?mission=${encodeURIComponent(mission.text)}`);
  };

  const handleDelete = async (mission) => {
    setMissions(prev => prev.filter(m => m.id !== mission.id));
    toast.success('Misión eliminada');
  };

  return (
    <section>
      {/* Título de sección */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🎯</span>
        <h2 className="text-lg font-bold text-slate-700">Misiones</h2>
        <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {missions.length}
        </span>
      </div>

      <div className="space-y-3">
        {activeMissions.map((mission, i) => {
          const isChat = isChatMission(mission.text);
          const created = new Date(mission.created_date);
          const expiry = new Date(created.getTime() + 12 * 60 * 60 * 1000);
          const hoursLeft = Math.max(0, Math.round((expiry - new Date()) / 3600000));
          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl p-4 border shadow-sm flex items-center gap-4 ${
                i === 0
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                  : 'bg-white border-slate-100'
              }`}
            >
              {/* Icono */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow ${
                isChat ? 'bg-gradient-to-br from-sky-400 to-indigo-500' : 'bg-gradient-to-br from-emerald-400 to-teal-500'
              }`}>
                {isChat
                  ? <MessageCircle className="w-6 h-6 text-white" />
                  : <span className="text-2xl">📋</span>
                }
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                {i === 0 && (
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">
                    ✨ Misión nueva
                  </p>
                )}
                <p className="text-slate-800 font-medium text-sm leading-snug">{mission.text}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="text-xs text-slate-400">⏳ {hoursLeft}h restantes</p>
                  {isChat && (
                    <span className="text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> Chat con Sofia
                    </span>
                  )}
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <img src="https://media.base44.com/images/public/69e3f8f663fc316a299cbdbd/453ae61fd_image.png" alt="Monad" className="w-3 h-3 object-contain" />
                    +50 Monads
                  </span>
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={() => handleAccept(mission)}
                  className={`rounded-xl gap-1 text-xs font-bold shadow ${
                    i === 0
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {i === 0 ? (
                    <><Sparkles className="w-3 h-3" /> ¡Ir!</>
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(mission)}
                  className="rounded-xl text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 h-7"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}