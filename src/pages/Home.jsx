import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Backpack, Shield, BookOpen, Sparkles } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      // Verificar si hay perfil local
      const localProfile = localStorage.getItem('sofia_profile');
      if (localProfile) {
        const parsed = JSON.parse(localProfile);
        if (parsed.onboarding_completed) {
          navigate(createPageUrl('Dashboard'));
          return;
        }
      }

      // Si está autenticado, verificar perfil en base de datos
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        const profiles = await base44.entities.StudentProfile.filter({ created_by: user.email });
        
        if (profiles.length > 0 && profiles[0].onboarding_completed) {
          navigate(createPageUrl('Dashboard'));
          return;
        }
      }
    } catch (error) {
      console.log('No existing session:', error);
    }
    setLoading(false);
  };

  const handleRoleSelection = (role) => {
    switch (role) {
      case 'student':
        navigate(createPageUrl('Onboarding'));
        break;
      case 'parent':
        navigate(createPageUrl('ParentLogin'));
        break;
      case 'teacher':
        navigate(createPageUrl('TeacherDashboard'));
        break;
    }
  };

  if (loading) {
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

  const roles = [
    {
      id: 'student',
      title: 'ALUMNO',
      subtitle: '¡Comienza tu aventura!',
      icon: Backpack,
      gradient: 'from-orange-400 to-sky-500',
      glow: 'shadow-orange-400/30',
      emoji: '🎒'
    },
    {
      id: 'parent',
      title: 'PADRE/TUTOR',
      subtitle: 'Monitorea el progreso',
      icon: Shield,
      gradient: 'from-green-400 to-teal-500',
      glow: 'shadow-green-400/30',
      emoji: '🛡️'
    },
    {
      id: 'teacher',
      title: 'MAESTRO',
      subtitle: 'Supervisa a tus estudiantes',
      icon: BookOpen,
      gradient: 'from-purple-400 to-indigo-600',
      glow: 'shadow-purple-400/30',
      emoji: '📚'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Decorative floating elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-24 h-24 bg-yellow-300/20 rounded-full blur-2xl"
      />
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          x: [0, 10, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-32 right-20 w-40 h-40 bg-pink-300/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-1/2 left-1/4 w-32 h-32 bg-green-300/20 rounded-full blur-2xl"
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        
        {/* Logo and Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 relative">
              <span className="text-5xl">✨</span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </motion.div>
            </div>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600">
              Sofia
            </span>
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl font-bold text-slate-700 mb-2"
          >
            ¿Quién eres hoy?
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-slate-500"
          >
            Selecciona tu rol para comenzar
          </motion.p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index, duration: 0.6 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -10
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRoleSelection(role.id)}
                className="group relative"
              >
                {/* Card glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-300`} />
                
                {/* Card content */}
                <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50 hover:border-white/80 transition-all duration-300">
                  {/* Icon container */}
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                    className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center shadow-lg ${role.glow}`}
                  >
                    <span className="text-4xl">{role.emoji}</span>
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {role.title}
                  </h3>
                  
                  {/* Subtitle */}
                  <p className="text-slate-600 text-sm mb-4">
                    {role.subtitle}
                  </p>

                  {/* Action indicator */}
                  <motion.div
                    className="flex items-center justify-center gap-2 text-sky-600 font-medium"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  >
                    <span>Comenzar</span>
                    <span>→</span>
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-sm text-slate-400 text-center max-w-md"
        >
          ✨ Compañero inteligente de estudio para estudiantes de primaria y secundaria
        </motion.p>
      </div>
    </div>
  );
}