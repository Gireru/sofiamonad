import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, User, Shield, Bell, Palette, Key, Copy, 
  Check, LogOut, ChevronRight, RefreshCw
} from 'lucide-react';

import Avatar3D from '@/components/avatars/Avatar3D';

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokenGenerated, setTokenGenerated] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      const profiles = await base44.entities.StudentProfile.filter({ created_by: userData.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const updateProfile = async (updates) => {
    if (!profile) return;
    setLoading(true);
    try {
      await base44.entities.StudentProfile.update(profile.id, updates);
      setProfile({ ...profile, ...updates });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setLoading(false);
  };

  const generateTeacherToken = async () => {
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    try {
      await base44.entities.TeacherToken.create({
        token_code: token,
        student_id: profile.id,
        parent_email: user.email,
        expires_at: expiresAt.toISOString(),
        is_used: false
      });
      setTokenGenerated(token);
    } catch (error) {
      console.error('Error generating token:', error);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(tokenGenerated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    base44.auth.logout();
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
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-slate-800">Configuración</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Profile section */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <User className="w-5 h-5" />
              Mi perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar3D type={profile.avatar_type} size="lg" state="idle" />
              <div>
                <p className="font-bold text-lg text-slate-800">{profile.display_name}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
                <p className="text-sm text-sky-600">Compañero: {profile.companion_name}</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl('Onboarding'))}
              className="w-full rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Cambiar compañero
            </Button>
          </CardContent>
        </Card>

        {/* Parent controls */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <Shield className="w-5 h-5" />
              Control parental
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="font-medium text-slate-700">Modo estricto</p>
                <p className="text-sm text-slate-500">Filtros adicionales de seguridad</p>
              </div>
              <Switch
                checked={profile.strict_mode}
                onCheckedChange={(checked) => updateProfile({ strict_mode: checked })}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-slate-700 mb-3">Invitar maestro</h3>
              <p className="text-sm text-slate-500 mb-4">
                Genera un código para que el maestro pueda ver el progreso del estudiante.
              </p>
              
              {tokenGenerated ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-3 font-mono text-lg text-center text-green-700">
                    {tokenGenerated}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToken}
                    className="rounded-xl"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={generateTeacherToken}
                  className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Generar código de maestro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <Palette className="w-5 h-5" />
              Apariencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {['robot', 'owl', 'fox'].map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateProfile({ avatar_type: type })}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    profile.avatar_type === type 
                      ? 'border-sky-400 bg-sky-50' 
                      : 'border-slate-200 bg-white hover:border-sky-300'
                  }`}
                >
                  <Avatar3D type={type} size="md" state="idle" />
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </Button>

      </main>
    </div>
  );
}