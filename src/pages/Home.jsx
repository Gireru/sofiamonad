import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Users, Shield, ChevronRight, Star } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const user = await base44.auth.me();
        const profiles = await base44.entities.StudentProfile.filter({ created_by: user.email });
        
        if (profiles.length > 0 && profiles[0].onboarding_completed) {
          navigate(createPageUrl('Dashboard'));
        } else if (profiles.length > 0) {
          navigate(createPageUrl('Onboarding'));
        }
      }
    } catch (error) {
      console.log('Not authenticated');
    }
    setLoading(false);
  };

  const handleStart = () => {
    if (isAuthenticated) {
      navigate(createPageUrl('Onboarding'));
    } else {
      base44.auth.redirectToLogin(createPageUrl('Onboarding'));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 left-10 w-40 h-40 bg-yellow-300/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-40 right-10 w-60 h-60 bg-pink-300/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-1/2 left-1/4 w-32 h-32 bg-green-300/30 rounded-full blur-2xl"
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg">
                <span className="text-xl">✨</span>
              </div>
              <span className="font-bold text-xl text-slate-800">Sofia</span>
            </div>
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Floating avatars */}
            <div className="flex justify-center gap-4 mb-8">
              {['🤖', '🦉', '🦊'].map((emoji, i) => (
                <motion.div
                  key={emoji}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2 + i * 0.5, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-xl border-2 border-white"
                  >
                    <span className="text-3xl">{emoji}</span>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
                Tu compañero de estudio
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">
                  con súper poderes ✨
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Sofia es tu amigo virtual que te ayuda a aprender, crear y explorar. 
                Diseñado especialmente para estudiantes de primaria y secundaria en México.
              </p>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleStart}
                  className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 shadow-xl shadow-sky-500/30 gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  ¡Comenzar aventura!
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
              {[
                {
                  icon: BookOpen,
                  title: 'Tutor Personal',
                  description: 'Te ayuda con tareas siguiendo los libros de la SEP',
                  gradient: 'from-green-400 to-emerald-500'
                },
                {
                  icon: Users,
                  title: 'Triángulo Educativo',
                  description: 'Conecta estudiantes, padres y maestros',
                  gradient: 'from-purple-400 to-pink-500'
                },
                {
                  icon: Shield,
                  title: 'Seguro y Divertido',
                  description: 'Filtros de seguridad y contenido apropiado',
                  gradient: 'from-blue-400 to-cyan-500'
                }
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg mx-auto`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-12">
              {['🇲🇽 Hecho para México', '📚 Contenido SEP', '🔒 100% Seguro'].map((badge) => (
                <span
                  key={badge}
                  className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm font-medium text-slate-600 border border-white/50"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 text-center text-sm text-slate-500">
          <p>Tecnología con corazón para la educación del futuro 💙</p>
        </footer>
      </div>
    </div>
  );
}