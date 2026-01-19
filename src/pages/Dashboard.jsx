import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Zap, Clock, Star, Trophy, Settings, ChevronRight, MessageSquare } from 'lucide-react';

import Avatar3D from '@/components/avatars/Avatar3D';
import StatsCard from '@/components/dashboard/StatsCard';
import QuickActions from '@/components/dashboard/QuickActions';
import AchievementBadge from '@/components/dashboard/AchievementBadge';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    loadProfile();
    updateGreeting();
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('¡Buenos días');
    else if (hour < 18) setGreeting('¡Buenas tardes');
    else setGreeting('¡Buenas noches');
  };

  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.StudentProfile.filter({ created_by: user.email });
      
      if (profiles.length === 0 || !profiles[0].onboarding_completed) {
        navigate(createPageUrl('Onboarding'));
        return;
      }
      
      setProfile(profiles[0]);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-10 w-60 h-60 bg-pink-300/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-green-300/20 rounded-full blur-2xl" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg">
              <span className="text-xl">✨</span>
            </div>
            <span className="font-bold text-xl text-slate-800">Sofia</span>
          </div>
          
          <Link to={createPageUrl('Settings')}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="w-5 h-5 text-slate-600" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 pb-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Welcome section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Avatar3D type={profile.avatar_type} size="xl" state="idle" />
              </motion.div>
              
              <div className="flex-1 text-center sm:text-left">
                <p className="text-slate-500 mb-1">{greeting}, {profile.display_name}! 👋</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                  <span className="text-sky-500">{profile.companion_name}</span> te está esperando
                </h1>
                <p className="text-slate-600">¿Qué vamos a aprender hoy?</p>
                
                <Link to={createPageUrl('Chat')}>
                  <Button className="mt-4 rounded-full px-6 gap-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 shadow-lg shadow-sky-500/30">
                    <MessageSquare className="w-4 h-4" />
                    Empezar a chatear
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Quick actions */}
          <section>
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="text-xl">🚀</span> Acciones rápidas
            </h2>
            <QuickActions />
          </section>

          {/* Stats */}
          <section>
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="text-xl">📊</span> Seguimiento Académico
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard 
              icon={Zap} 
              value={profile.xp_points || 0} 
              label="XP puntos" 
              gradient="from-yellow-400 to-orange-500"
              delay={0.1}
            />
            <StatsCard 
              icon={Clock} 
              value={`${profile.total_minutes || 0}m`} 
              label="Tiempo total" 
              gradient="from-blue-400 to-cyan-500"
              delay={0.2}
            />
            <StatsCard 
              icon={Star} 
              value={profile.total_sessions || 0} 
              label="Sesiones" 
              gradient="from-purple-400 to-pink-500"
              delay={0.3}
            />
            <StatsCard 
              icon={Trophy} 
              value={profile.achievements?.length || 1} 
              label="Logros" 
              gradient="from-green-400 to-emerald-500"
              delay={0.4}
            />
            </div>
          </section>

          {/* Achievements */}
          <section className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="text-xl">🏆</span> Tus logros
            </h2>
            
            <div className="flex flex-wrap gap-6">
              {(profile.achievements || ['first_login']).map((achievement) => (
                <AchievementBadge key={achievement} achievementId={achievement} />
              ))}
            </div>
          </section>

          {/* Tip of the day */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-5 border border-amber-200/50"
          >
            <div className="flex gap-4">
              <span className="text-3xl">💡</span>
              <div>
                <h3 className="font-bold text-amber-800 mb-1">Tip del día</h3>
                <p className="text-amber-700 text-sm">
                  ¿Sabías que puedes pedirle a {profile.companion_name} que te explique algo con un dibujo? 
                  Solo di "Explícamelo con un dibujo" 🎨
                </p>
              </div>
            </div>
          </motion.section>

        </div>
      </main>
    </div>
  );
}