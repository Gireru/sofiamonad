import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, Key, UserCheck, BookOpen, TrendingUp,
  Clock, BarChart3, GraduationCap, AlertCircle
} from 'lucide-react';

import Avatar3D from '@/components/avatars/Avatar3D';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [tokenInput, setTokenInput] = useState('');
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [metrics, setMetrics] = useState([]);
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
          students.push(profiles[0]);
        }
      }
      setLinkedStudents(students);
      
      if (students.length > 0) {
        selectStudent(students[0]);
      }
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

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    
    try {
      const metricsData = await base44.entities.LearningMetric.filter({ 
        student_id: student.id 
      });
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  // Calculate stats for selected student
  const getStudentStats = () => {
    if (!metrics.length) return { totalMinutes: 0, sessions: 0, topTopics: [] };

    const totalMinutes = metrics.reduce((sum, m) => sum + (m.minutes_spent || 0), 0);
    const sessions = metrics.length;
    
    const topics = metrics.reduce((acc, m) => {
      if (m.topic) {
        acc[m.topic] = (acc[m.topic] || 0) + 1;
      }
      return acc;
    }, {});

    const topTopics = Object.entries(topics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return { totalMinutes, sessions, topTopics };
  };

  const stats = getStudentStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 pb-8">
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
            <h1 className="text-xl font-bold text-slate-800">Panel de Maestro</h1>
            <p className="text-sm text-slate-500">Seguimiento de estudiantes</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
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

        {/* Student selector */}
        {linkedStudents.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <GraduationCap className="w-5 h-5" />
                Mis estudiantes ({linkedStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {linkedStudents.map((student) => (
                  <motion.button
                    key={student.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectStudent(student)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      selectedStudent?.id === student.id 
                        ? 'border-emerald-400 bg-emerald-50' 
                        : 'border-slate-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <Avatar3D type={student.avatar_type} size="sm" state="idle" />
                    <div className="text-left">
                      <p className="font-medium text-slate-800">{student.display_name}</p>
                      <p className="text-xs text-slate-500">
                        {student.grade?.replace('_', '° ')}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected student details */}
        {selectedStudent && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-800">{stats.totalMinutes}m</p>
                <p className="text-sm text-slate-500">Tiempo total</p>
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
                <p className="text-2xl font-bold text-slate-800">{stats.sessions}</p>
                <p className="text-sm text-slate-500">Sesiones</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-800">{selectedStudent.xp_points || 0}</p>
                <p className="text-sm text-slate-500">XP puntos</p>
              </motion.div>
            </div>

            {/* Topics */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <BarChart3 className="w-5 h-5" />
                  ¿Qué temas reforzó {selectedStudent.display_name} con {selectedStudent.companion_name}?
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topTopics.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topTopics.map(([topic, count], i) => (
                      <div key={topic} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                          ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500'][i]
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-700 capitalize">{topic}</p>
                          <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${
                                ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500'][i]
                              }`}
                              style={{ width: `${(count / stats.topTopics[0][1]) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-slate-500">{count}x</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Aún no hay datos de aprendizaje</p>
                    <p className="text-sm">Los temas aparecerán aquí cuando el estudiante use Sofia</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy note */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <div className="flex gap-3">
                <UserCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-800">Acceso autorizado</p>
                  <p className="text-sm text-emerald-600">
                    Los padres de {selectedStudent.display_name} te han dado acceso a ver 
                    las métricas de aprendizaje. El contenido de las conversaciones es privado.
                  </p>
                </div>
              </div>
            </div>
          </>
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