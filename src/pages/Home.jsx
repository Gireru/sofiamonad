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
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            x: [0, 20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            x: [0, -20, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-br from-green-300/15 to-teal-300/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [0, -40, 0],
            rotate: [0, -15, 0]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-40 w-72 h-72 bg-gradient-to-br from-blue-300/15 to-indigo-300/15 rounded-full blur-3xl"
        />
      </div>
      
      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        
        {/* Logo and Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ 
              y: [0, -8, 0],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-8 relative"
          >
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-3xl blur-2xl opacity-40 scale-110" />
            
            {profile && inventory ? (
              <div className="relative w-28 h-28 mx-auto">
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
              <div className="relative w-28 h-28 mx-auto bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
                <motion.span 
                  className="text-6xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  ✨
                </motion.span>
                
                {/* Orbiting sparkles */}
                {[0, 120, 240].map((angle, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.3,
                    }}
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    >
                      <Sparkles 
                        className="w-6 h-6 text-yellow-300" 
                        style={{
                          transform: `translate(-50%, -50%) translate(${Math.cos(angle * Math.PI / 180) * 60}px, ${Math.sin(angle * Math.PI / 180) * 60}px)`,
                        }}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 drop-shadow-sm">
                Sofia
              </span>
            </h1>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                ¿Quién eres hoy?
              </p>
              <p className="text-lg text-slate-500 font-medium">
                Elige tu rol para empezar la aventura
              </p>
            </motion.div>
          </motion.div>
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
                whileHover={{ 
                  scale: 1.06,
                  y: -12,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleRoleSelection(role.id)}
                className="group relative"
              >
                {/* Animated glow effect */}
                <motion.div 
                  className={`absolute -inset-1 bg-gradient-to-br ${role.gradient} rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-70 transition-all duration-500`}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                />
                
                {/* Card content */}
                <div className={`relative bg-gradient-to-br ${role.cardBg} backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border-2 border-white/60 group-hover:border-white/90 transition-all duration-500 overflow-hidden`}>
                  {/* Top shine effect */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                  
                  {/* Icon container with floating animation */}
                  <motion.div
                    animate={{ 
                      y: [0, -8, 0],
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.4
                    }}
                    className="relative mb-6"
                  >
                    {/* Icon glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} rounded-2xl blur-xl opacity-50 scale-110`} />
                    
                    <div className={`relative w-24 h-24 mx-auto bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center shadow-2xl ${role.glow} border-4 border-white/40`}>
                      <motion.span 
                        className="text-5xl"
                        animate={{ 
                          rotate: [0, 8, -8, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity,
                          delay: index * 0.3
                        }}
                      >
                        {role.emoji}
                      </motion.span>
                    </div>
                  </motion.div>

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
                  <motion.div
                    className={`flex items-center justify-center gap-2 font-bold text-${role.accentColor}-600 bg-white/60 rounded-xl py-3 px-4 group-hover:bg-white/90 transition-all duration-300`}
                    whileHover={{
                      x: [0, 3, 0],
                      transition: { duration: 0.5, repeat: Infinity }
                    }}
                  >
                    <span>Entrar</span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ 
                        duration: 1.2, 
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                      className="text-xl"
                    >
                      →
                    </motion.span>
                  </motion.div>

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
          <motion.div
            animate={{ 
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
            className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/80 shadow-lg"
          >
            <span className="text-2xl">✨</span>
            <p className="text-sm font-medium text-slate-600">
              Compañero inteligente de estudio para primaria y secundaria
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}