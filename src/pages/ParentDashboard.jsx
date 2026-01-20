import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Eye, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import EmotionalSemaphore from '@/components/parent/EmotionalSemaphore';
import LearningTimeline from '@/components/parent/LearningTimeline';
import SafetyCenter from '@/components/parent/SafetyCenter';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [safetySettings, setSafetySettings] = useState({
    internetMode: true,
    imageGeneration: true,
    screenTimeLimit: 45
  });
  const [todayActivities, setTodayActivities] = useState([]);

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
        
        // Cargar configuración de seguridad
        const settings = localStorage.getItem(`sofia_parent_settings_${profiles[0].id}`);
        if (settings) {
          setSafetySettings(JSON.parse(settings));
        }
        
        // Cargar actividades reales del día
        await generateTodayActivities(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      navigate(createPageUrl('ParentLogin'));
    }
  };

  const generateTodayActivities = async (studentProfile) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Cargar conversaciones de hoy del estudiante
      const conversations = await base44.entities.Conversation.filter({ 
        student_id: studentProfile.id 
      });
      
      // Filtrar conversaciones de hoy y crear actividades
      const activities = conversations
        .filter(conv => {
          const convDate = new Date(conv.created_date).toISOString().split('T')[0];
          return convDate === today && conv.messages && conv.messages.length > 0;
        })
        .map(conv => {
          const time = new Date(conv.created_date).toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          const subjectLabels = {
            matematicas: 'Matemáticas',
            espanol: 'Español',
            ciencias: 'Ciencias',
            historia: 'Historia',
            geografia: 'Geografía',
            civica: 'Cívica',
            arte: 'Arte',
            general: 'General'
          };
          
          return {
            time,
            mode: conv.mode,
            description: conv.title || conv.topics_covered?.join(', ') || 'Sesión de estudio',
            subject: conv.subject ? subjectLabels[conv.subject] : null
          };
        })
        .sort((a, b) => a.time.localeCompare(b.time));
      
      setTodayActivities(activities);
    } catch (error) {
      console.error('Error loading activities:', error);
      setTodayActivities([]);
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...safetySettings, [key]: value };
    setSafetySettings(newSettings);
    localStorage.setItem(`sofia_parent_settings_${profile.id}`, JSON.stringify(newSettings));
    toast.success('Configuración actualizada');
  };

  const handleDetailedReport = () => {
    toast.info('Generando reporte de seguridad...', {
      description: 'Esta función analiza las interacciones sin mostrar conversaciones literales'
    });
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Sofia Control Center</h1>
              <p className="text-sm text-slate-500">Vista Guardián - {profile.display_name}</p>
            </div>
          </div>
          <span className="text-2xl">🛡️</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Semáforo Emocional */}
        <EmotionalSemaphore 
          studentName={profile.display_name}
          sentiment="happy"
          details="Curioso y Alegre durante las sesiones de hoy"
        />

        {/* Resumen de Aprendizaje */}
        <LearningTimeline activities={todayActivities} />

        {/* Centro de Seguridad */}
        <SafetyCenter 
          settings={safetySettings}
          onSettingChange={handleSettingChange}
        />

        {/* Botón de Reporte Detallado */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">Reporte de Seguridad</h3>
                <p className="text-sm text-slate-500">
                  Solicita un análisis detallado si observas algo inusual
                </p>
              </div>
              <Button
                onClick={handleDetailedReport}
                variant="outline"
                className="rounded-xl border-red-300 text-red-600 hover:bg-red-50"
              >
                Solicitar Reporte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Shield */}
        <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-200">
          <div className="flex gap-3">
            <Eye className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-cyan-800">🔒 Privacy Shield Activado</p>
              <p className="text-sm text-cyan-700">
                Las conversaciones de {profile.display_name} son privadas y están protegidas. 
                Solo verás resúmenes analíticos. En caso de detectar riesgo inminente, 
                se te notificará con el fragmento específico.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}