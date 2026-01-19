import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, LogIn, AlertCircle } from 'lucide-react';

export default function ParentLogin() {
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
      
      // Buscar código de acceso
      const access = await base44.entities.ParentAccess.filter({ 
        access_code: code.toUpperCase(),
        is_active: true 
      });

      if (access.length === 0) {
        setError('Código inválido o expirado');
        setLoading(false);
        return;
      }

      // Vincular padre con estudiante
      await base44.entities.ParentAccess.update(access[0].id, {
        parent_email: user.email
      });

      // Redirigir al dashboard de padres
      navigate(createPageUrl('ParentDashboard'));
    } catch (error) {
      console.error('Error:', error);
      setError('Error al validar el código');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
            Acceso para Padres
          </h1>
          <p className="text-center text-slate-600 mb-8">
            Ingresa el código que tu hijo/a te compartió
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
                className="text-center text-2xl font-mono tracking-wider rounded-2xl border-2 border-indigo-200 focus:border-indigo-400"
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
              className="w-full rounded-2xl py-6 text-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/30"
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
            <p>Pídele a tu hijo/a que lo genere en Configuración</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}