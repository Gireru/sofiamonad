import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Backpack, Shield, BookOpen, Sparkles } from 'lucide-react';
import Avatar3D from '@/components/avatars/Avatar3D';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [inventory, setInventory] = useState(null);

  useEffect(() => {
    checkExistingSession();
    loadProfileAndInventory();
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

  const loadProfileAndInventory = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        const profiles = await base44.entities.StudentProfile.filter({ created_by: user.email });
        
        if (profiles.length > 0) {
          setProfile(profiles[0]);
          
          const inventories = await base44.entities.StudentInventory.filter({ 
            student_id: profiles[0].id 
          });
          
          if (inventories.length > 0) {
            setInventory(inventories[0]);
          }
        }
      }
    } catch (error) {
      console.log('Could not load profile/inventory:', error);
    }
  };

  const getItemEmoji = (itemId) => {
    const SHOP_CATALOG = [
      { item_id: 'hat_wizard', emoji: '🎩' },
      { item_id: 'hat_graduation', emoji: '🎓' },
      { item_id: 'hat_crown', emoji: '👑' },
      { item_id: 'glasses_cool', emoji: '😎' },
      { item_id: 'glasses_nerd', emoji: '🤓' },
    ];
    return SHOP_CATALOG.find(i => i.item_id === itemId)?.emoji || '';
  };

  const handleRoleSelection = async (role) => {
    if (role === 'student') {
      navigate(createPageUrl('Onboarding'));
    } else if (role === 'parent') {
      // Limpiar sesión de estudiante si existe
      localStorage.removeItem('sofia_profile');
      
      // Verificar si está autenticado
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        // Redirigir a login y volver después
        base44.auth.redirectToLogin(createPageUrl('ParentLogin'));
      } else {
        navigate(createPageUrl('ParentLogin'));
      }
    } else if (role === 'teacher') {
      // Limpiar sesión de estudiante si existe
      localStorage.removeItem('sofia_profile');
      
      // Verificar si está autenticado
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        // Redirigir a login y volver después
        base44.auth.redirectToLogin(createPageUrl('TeacherLogin'));
      } else {
        navigate(createPageUrl('TeacherLogin'));
      }
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
      title: 'Soy Estudiante',
      subtitle: '¡Aprende jugando!',
      description: 'Explora, crea y descubre con tu compañero de estudios',
      icon: Backpack,
      gradient: 'from-orange-400 via-pink-400 to-sky-500',
      cardBg: 'from-orange-50/80 to-sky-50/80',
      glow: 'shadow-orange-400/50',
      emoji: '🎒',
      accentColor: 'orange'
    },
    {
      id: 'parent',
      title: 'Soy Padre/Tutor',
      subtitle: 'Acompaña su aprendizaje',
      description: 'Supervisa el progreso y mantén a tu hijo seguro',
      icon: Shield,
      gradient: 'from-green-400 via-emerald-400 to-teal-500',
      cardBg: 'from-green-50/80 to-teal-50/80',
      glow: 'shadow-green-400/50',
      emoji: '🛡️',
      accentColor: 'green'
    },
    {
      id: 'teacher',
      title: 'Soy Maestro',
      subtitle: 'Guía tu clase',
      description: 'Gestiona estudiantes y envía misiones educativas',
      icon: BookOpen,
      gradient: 'from-purple-400 via-indigo-400 to-blue-600',
      cardBg: 'from-purple-50/80 to-indigo-50/80',
      glow: 'shadow-purple-400/50',
      emoji: '📚',
      accentColor: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Static background elements - optimized for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-br from-green-300/15 to-teal-300/15 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        
        {/* New Animated Welcome */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          {/* Floating Logo - optimized */}
          <motion.div className="relative inline-block mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 15,
                delay: 0.2 
              }}
              className="relative"
            >
              {profile && inventory ? (
                <div className="relative w-32 h-32 mx-auto">
                  <Avatar3D type={profile.avatar_type} size="xl" state="idle" />
                  
                  {inventory.equipped_items?.hat && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-4xl">
                      {getItemEmoji(inventory.equipped_items.hat)}
                    </div>
                  )}
                  {inventory.equipped_items?.glasses && (
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-3xl">
                      {getItemEmoji(inventory.equipped_items.glasses)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-6xl">✨</span>
                </div>
              )}
            </motion.div>
          </motion.div>
          
          {/* Title with split animation */}
          <div className="overflow-hidden mb-6">
            <motion.h1 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
              className="text-7xl md:text-8xl font-black tracking-tight"
            >
              <motion.span
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 bg-[length:200%_auto]"
                style={{
                  display: "inline-block",
                }}
              >
                Sofia
              </motion.span>
            </motion.h1>
          </div>
          
          {/* Subtitle with stagger effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="space-y-2"
          >
            <p className="text-2xl md:text-3xl font-bold text-slate-800">
              Tu compañero inteligente de estudio
            </p>
            <p className="text-lg text-slate-500 font-medium">
              Aprende de forma divertida y personalizada 🚀
            </p>
          </motion.div>
        </motion.div>

        {/* Guest Trial Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mb-8"
        >
          <motion.button
            onClick={() => navigate(createPageUrl('Chat') + '?mode=guest')}
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-0.5">
              <div className="bg-white rounded-2xl px-8 py-4 flex items-center gap-3">
                <p className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                  Empezar a chatear
                </p>
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 0.6 + (0.15 * index), 
                  duration: 0.7,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.03, y: -8 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleRoleSelection(role.id)}
                className="group relative"
              >
                {/* Static glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-br ${role.gradient} rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                
                {/* Card content */}
                <div className={`relative bg-gradient-to-br ${role.cardBg} backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border-2 border-white/60 group-hover:border-white/90 transition-all duration-500 overflow-hidden`}>
                  {/* Top shine effect */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                  
                  {/* Icon container - optimized */}
                  <div className="relative mb-6">
                    <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/40`}>
                      <span className="text-5xl">{role.emoji}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                    {role.title}
                  </h3>
                  
                  {/* Subtitle */}
                  <p className="text-base font-semibold text-slate-600 mb-2">
                    {role.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-slate-500 mb-6 min-h-[2.5rem]">
                    {role.description}
                  </p>

                  {/* Action button */}
                  <div className={`flex items-center justify-center gap-2 font-bold text-${role.accentColor}-600 bg-white/60 rounded-xl py-3 px-4 group-hover:bg-white/90 transition-all duration-300`}>
                    <span>Entrar</span>
                    <span className="text-xl">→</span>
                  </div>

                  {/* Corner decoration */}
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/50" />
                  <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-white/50" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/80 shadow-lg">
            <span className="text-2xl">✨</span>
            <p className="text-sm font-medium text-slate-600">
              Compañero inteligente de estudio para primaria y secundaria
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}