import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, LogIn, AlertCircle } from 'lucide-react';

export default function TeacherLogin() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await base44.auth.me();
      
      // Buscar token de maestro
      const tokens = await base44.entities.TeacherToken.filter({ 
        token_code: code.toUpperCase()
      });

      if (tokens.length === 0) {
        setError('Código inválido');
        setLoading(false);
        return;
      }

      const token = tokens[0];

      // Verificar si ya fue usado
      if (token.is_used) {
        setError('Este código ya fue usado');
        setLoading(false);
        return;
      }

      // Verificar expiración
      if (new Date(token.expires_at) < new Date()) {
        setError('Este código ha expirado');
        setLoading(false);
        return;
      }

      // Vincular maestro con estudiante
      await base44.entities.TeacherToken.update(token.id, {
        teacher_email: user.email,
        is_used: true
      });

      // Redirigir al dashboard de maestros
      navigate(createPageUrl('TeacherDashboard'));
    } catch (error) {
      console.error('Error:', error);
      setError('Error al validar el código');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
            <BookOpen className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
            Acceso para Maestros
          </h1>
          <p className="text-center text-slate-600 mb-8">
            Ingresa el código que te compartió el padre/tutor
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Código de 6 caracteres"
                maxLength={6}
                className="text-center text-2xl font-mono tracking-wider rounded-2xl border-2 border-purple-200 focus:border-purple-400"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-2xl py-6 text-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/30"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Acceder
                </>
              )}
            </Button>
          </form>

          {/* Help text */}
          <div className="mt-6 text-center text-sm text-slate-500">
            <p>¿No tienes un código?</p>
            <p>Solicítalo al padre/tutor del estudiante</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}