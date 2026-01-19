import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Key, AlertCircle, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

import ClassGrid from '@/components/teacher/ClassGrid';
import AcademicAlerts from '@/components/teacher/AcademicAlerts';
import MissionBroadcast from '@/components/teacher/MissionBroadcast';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [tokenInput, setTokenInput] = useState('');
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLinkedStudents();
  }, []);

  const loadLinkedStudents = async () => {
    try {
      const user = await base44.auth.me();
      const tokens = await base44.entities.TeacherToken.filter({ 
        teacher_email: user.email,
        is_used: true 
      });

      const students = [];
      for (const token of tokens) {
        const profiles = await base44.entities.StudentProfile.filter({ id: token.student_id });
        if (profiles.length > 0) {
          // Agregar datos mock para demostración
          students.push({
            ...profiles[0],
            lastActive: new Date().toISOString(),
            currentTopic: 'Fracciones'
          });
        }
      }
      setLinkedStudents(students);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleLinkStudent = async () => {
    if (!tokenInput.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const user = await base44.auth.me();
      const tokens = await base44.entities.TeacherToken.filter({ 
        token_code: tokenInput.toUpperCase() 
      });

      if (tokens.length === 0) {
        setError('Código no válido');
        setLoading(false);
        return;
      }

      const token = tokens[0];
      
      if (token.is_used) {
        setError('Este código ya fue usado');
        setLoading(false);
        return;
      }

      if (new Date(token.expires_at) < new Date()) {
        setError('Este código ha expirado');
        setLoading(false);
        return;
      }

      // Link teacher
      await base44.entities.TeacherToken.update(token.id, {
        teacher_email: user.email,
        is_used: true
      });

      setTokenInput('');
      loadLinkedStudents();
    } catch (error) {
      setError('Error al vincular estudiante');
    }
    
    setLoading(false);
  };

  const handleSendMission = async (missionText) => {
    // En producción, esto crearía registros en una entidad Mission vinculados a los estudiantes
    console.log('Sending mission to students:', missionText);
    // Simulación de delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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
              <p className="text-sm text-slate-500">Vista Aula - Gestión de Clase</p>
            </div>
          </div>
          <span className="text-2xl">📚</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* Link new student */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <Key className="w-5 h-5" />
              Vincular estudiante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">
              Ingresa el código que te proporcionó el padre/tutor del estudiante.
            </p>
            
            <div className="flex gap-3">
              <Input
                placeholder="Código (ej: ABC123)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                className="font-mono text-lg tracking-wider uppercase"
                maxLength={6}
              />
              <Button
                onClick={handleLinkStudent}
                disabled={loading || !tokenInput.trim()}
                className="bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                {loading ? 'Vinculando...' : 'Vincular'}
              </Button>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Clase */}
        {linkedStudents.length > 0 && (
          <ClassGrid 
            students={linkedStudents}
            onSelectStudent={(student) => toast.info(`Ver detalles de ${student.display_name}`)}
          />
        )}

        {/* Alertas Académicas */}
        {linkedStudents.length > 0 && (
          <AcademicAlerts />
        )}

        {/* Enviar Misión */}
        {linkedStudents.length > 0 && (
          <MissionBroadcast 
            studentCount={linkedStudents.length}
            onSendMission={handleSendMission}
          />
        )}

        {linkedStudents.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Sin estudiantes vinculados</h3>
            <p className="text-slate-500">
              Ingresa un código de invitación de un padre/tutor para comenzar a ver el progreso de sus hijos.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}