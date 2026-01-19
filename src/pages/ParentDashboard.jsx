import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, Clock, BookOpen, TrendingUp, Calendar,
  Shield, Eye, BarChart3, Users
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import Avatar3D from '@/components/avatars/Avatar3D';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      
      // Verificar si es padre con acceso
      const parentAccess = await base44.entities.ParentAccess.filter({ 
        parent_email: user.email,
        is_active: true 
      });
      
      if (parentAccess.length === 0) {
        // No tiene acceso, redirigir a login de padres
        navigate(createPageUrl('ParentLogin'));
        return;
      }
      
      // Obtener perfil del estudiante vinculado
      const profiles = await base44.entities.StudentProfile.filter({ 
        id: parentAccess[0].student_id 
      });
      
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        
        // Load metrics
        const metricsData = await base44.entities.LearningMetric.filter({ 
          student_id: profiles[0].id 
        });
        setMetrics(metricsData);
        
        // Load conversations
        const convData = await base44.entities.Conversation.filter({ 
          student_id: profiles[0].id 
        });
        setConversations(convData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      navigate(createPageUrl('ParentLogin'));
    }
  };

  // Calculate stats
  const totalMinutesToday = metrics
    .filter(m => m.date === format(new Date(), 'yyyy-MM-dd'))
    .reduce((sum, m) => sum + (m.minutes_spent || 0), 0);

  const topSubjects = metrics.reduce((acc, m) => {
    if (m.subject) {
      acc[m.subject] = (acc[m.subject] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedSubjects = Object.entries(topSubjects)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Panel de Padres</h1>
            <p className="text-sm text-slate-500">Seguimiento de {profile.display_name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Student overview */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar3D type={profile.avatar_type} size="lg" state="idle" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800">{profile.display_name}</h2>
                <p className="text-slate-500">Compañero: {profile.companion_name}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                    {profile.grade?.replace('_', '° ').replace('primaria', 'Primaria').replace('secundaria', 'Secundaria')}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {profile.xp_points || 0} XP
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{totalMinutesToday}m</p>
            <p className="text-sm text-slate-500">Hoy</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{profile.total_sessions || 0}</p>
            <p className="text-sm text-slate-500">Sesiones</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{conversations.length}</p>
            <p className="text-sm text-slate-500">Conversaciones</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{profile.strict_mode ? 'Sí' : 'No'}</p>
            <p className="text-sm text-slate-500">Modo estricto</p>
          </motion.div>
        </div>

        {/* Topics of interest */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <BarChart3 className="w-5 h-5" />
              Temas más explorados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedSubjects.length > 0 ? (
              <div className="space-y-3">
                {sortedSubjects.map(([subject, count], i) => (
                  <div key={subject} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      ['bg-sky-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-pink-500'][i]
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-700 capitalize">{subject}</p>
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            ['bg-sky-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-pink-500'][i]
                          }`}
                          style={{ width: `${(count / sortedSubjects[0][1]) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">{count} veces</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aún no hay datos de aprendizaje</p>
                <p className="text-sm">Los temas aparecerán aquí cuando {profile.display_name} use Sofia</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy note */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex gap-3">
            <Eye className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Privacidad del estudiante</p>
              <p className="text-sm text-blue-600">
                Solo puedes ver estadísticas generales. El contenido de las conversaciones 
                de {profile.display_name} con {profile.companion_name} es privado.
              </p>
            </div>
          </div>
        </div>

        {/* Settings link */}
        <Link to={createPageUrl('Settings')}>
          <Button variant="outline" className="w-full rounded-xl">
            Ir a configuración
          </Button>
        </Link>

      </main>
    </div>
  );
}