import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

import AvatarSelector from '@/components/onboarding/AvatarSelector';
import CompanionNamer from '@/components/onboarding/CompanionNamer';
import GradeSelector from '@/components/onboarding/GradeSelector';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  
  const [profile, setProfile] = useState({
    display_name: '',
    avatar_type: 'robot',
    companion_name: 'Lia',
    companion_personality: 'lia',
    grade: '4_primaria',
    onboarding_completed: false
  });

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
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
        if (user?.full_name) {
          setUserName(user.full_name.split(' ')[0]);
          setProfile(prev => ({ ...prev, display_name: user.full_name.split(' ')[0] }));
        }
        
        const profiles = await base44.entities.StudentProfile.filter({ created_by: user.email });
        if (profiles.length > 0 && profiles[0].onboarding_completed) {
          navigate(createPageUrl('Dashboard'));
        }
      }
    } catch (error) {
      console.log('Error checking profile:', error);
    }
  };

  const handleComplete = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const finalProfile = {
        display_name: profile.display_name || userName || 'Estudiante',
        avatar_type: profile.avatar_type,
        companion_name: profile.companion_name,
        companion_personality: profile.companion_personality,
        grade: profile.grade,
        onboarding_completed: true,
        xp_points: 0,
        total_sessions: 0,
        total_minutes: 0,
        achievements: ['first_login']
      };

      // Guardar localmente
      localStorage.setItem('sofia_profile', JSON.stringify(finalProfile));

      let generatedCodes = null;

      // Si está autenticado, también guardar en la base de datos y generar códigos
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        const profiles = await base44.entities.StudentProfile.filter({ created_by: user.email });

        let studentProfile;
        if (profiles.length > 0) {
          await base44.entities.StudentProfile.update(profiles[0].id, finalProfile);
          studentProfile = profiles[0];
        } else {
          studentProfile = await base44.entities.StudentProfile.create(finalProfile);
        }

        // GENERACIÓN AUTOMÁTICA DE CÓDIGOS (Padre y Maestro)
        try {
          // Código para Padre
          const parentCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          await base44.entities.ParentAccess.create({
            access_code: parentCode,
            student_id: studentProfile.id,
            is_active: true
          });

          // Código para Maestro
          const teacherCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30); // Válido por 30 días
          await base44.entities.TeacherToken.create({
            token_code: teacherCode,
            student_id: studentProfile.id,
            parent_email: user.email,
            expires_at: expiresAt.toISOString(),
            is_used: false
          });

          generatedCodes = { parentCode, teacherCode };
        } catch (error) {
          console.error('Error generating codes:', error);
        }
      }

      // Si se generaron códigos, mostrarlos antes de navegar
      if (generatedCodes) {
        localStorage.setItem('sofia_welcome_codes', JSON.stringify(generatedCodes));
      }

      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Error completo:', error);
      alert(`Error al guardar: ${error.message || 'Intenta de nuevo'}`);
      setLoading(false);
    }
  };

  const steps = [
    {
      title: '¡Bienvenido a Sofia! 🌟',
      content: (
        <div className="flex flex-col items-center gap-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="w-32 h-32 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30"
          >
            <span className="text-6xl">🎓</span>
          </motion.div>
          
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-3">
              ¡Hola{userName ? `, ${userName}` : ''}! 👋
            </h1>
            <p className="text-lg text-slate-600 max-w-md">
              Estoy aquí para ser tu compañero de estudio. 
              ¡Vamos a crear juntos tu experiencia de aprendizaje perfecta!
            </p>
          </div>

          <div className="mt-4">
            <Input
              placeholder="¿Cómo te llamas?"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              className="text-center text-lg rounded-2xl border-2 border-sky-200 focus:border-sky-400 bg-white/80"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Tu compañero',
      content: (
        <AvatarSelector
          selected={profile.avatar_type}
          onSelect={(type) => setProfile({ ...profile, avatar_type: type })}
        />
      )
    },
    {
      title: 'Nombre',
      content: (
        <CompanionNamer
          avatarType={profile.avatar_type}
          selectedPersonality={profile.companion_personality}
          customName={profile.companion_name}
          onPersonalitySelect={(personality) => {
            setProfile({ ...profile, companion_personality: personality });
          }}
          onCustomNameChange={(name) => {
            setProfile({ ...profile, companion_name: name });
          }}
        />
      )
    },
    {
      title: 'Tu grado',
      content: (
        <GradeSelector
          selected={profile.grade}
          onSelect={(grade) => setProfile({ ...profile, grade: grade })}
        />
      )
    },
    {
      title: '¡Listo!',
      content: (
        <div className="flex flex-col items-center gap-6 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1 }}
            className="relative"
          >
            <div className="w-40 h-40 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30">
              <span className="text-7xl">🎉</span>
            </div>
            <motion.div
              className="absolute -top-4 -right-4"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-10 h-10 text-yellow-400" />
            </motion.div>
          </motion.div>
          
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">
              ¡Perfecto, {profile.display_name || 'campeón'}!
            </h2>
            <p className="text-lg text-slate-600 max-w-md">
              <span className="font-semibold text-sky-600">{profile.companion_name}</span> está 
              listo para ser tu compañero de aventuras. ¡Vamos a aprender juntos!
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300/30 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-pink-300/30 rounded-full blur-2xl" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-300/30 rounded-full blur-xl" />
      
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-slate-200">
        <motion.div
          className="h-full bg-gradient-to-r from-sky-400 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Maintenance Banner */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.02, 1],
            boxShadow: [
              "0 10px 30px rgba(245, 158, 11, 0.3)",
              "0 15px 40px rgba(245, 158, 11, 0.5)",
              "0 10px 30px rgba(245, 158, 11, 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-2xl p-4 border-2 border-amber-300 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 flex-shrink-0"
            >
              <span className="text-3xl">🔧</span>
            </motion.div>

            <div className="flex-1">
              <motion.p
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="font-black text-white text-sm sm:text-base"
              >
                ⚡ MANTENIMIENTO PROGRAMADO ⚡
              </motion.p>
              <p className="text-amber-50 text-xs sm:text-sm font-medium">
                Nueva actualización IA - 20 Febrero 2026, 3:00 PM
              </p>
            </div>

            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-8 h-8 flex-shrink-0"
            >
              <span className="text-2xl">✨</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6 pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-8"
          >
            {steps[step].content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center gap-4 mt-8">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="rounded-full px-6 gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </Button>
          )}
          
          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !profile.display_name}
              className="rounded-full px-8 gap-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 shadow-lg shadow-sky-500/30"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="rounded-full px-8 gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30"
            >
              {loading ? 'Guardando...' : '¡Comenzar aventura!'}
              <Sparkles className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mt-6">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-sky-500 w-6' : i < step ? 'bg-sky-400' : 'bg-slate-300'
              }`}
              animate={{ scale: i === step ? 1.2 : 1 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}