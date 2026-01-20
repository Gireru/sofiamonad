import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Palette, MessageCircle, Trash2, Calendar, Play } from 'lucide-react';
import { toast } from 'sonner';

const modeIcons = {
  tutor: BookOpen,
  creative: Palette,
  free: MessageCircle
};

const modeColors = {
  tutor: 'from-green-400 to-emerald-500',
  creative: 'from-purple-400 to-pink-500',
  free: 'from-orange-400 to-amber-500'
};

export default function History() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const localProfile = localStorage.getItem('sofia_profile');
      if (!localProfile) {
        navigate(createPageUrl('Onboarding'));
        return;
      }

      const parsed = JSON.parse(localProfile);
      setProfile(parsed);

      // Cargar conversaciones guardadas
      const convs = await base44.entities.Conversation.filter({ 
        student_id: parsed.id 
      });

      setConversations(convs.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      ));
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Error al cargar el historial');
    }
    setLoading(false);
  };

  const handleDelete = async (convId) => {
    if (!confirm('¿Eliminar esta conversación?')) return;

    try {
      await base44.entities.Conversation.delete(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      toast.success('Conversación eliminada');
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Error al eliminar');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    }
  };

  if (loading || !profile) {
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Mi Historial</h1>
              <p className="text-sm text-slate-500">Conversaciones guardadas</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {conversations.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-sky-200 to-indigo-200 rounded-full flex items-center justify-center">
                <Calendar className="w-10 h-10 text-sky-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">
                Aún no hay conversaciones
              </h3>
              <p className="text-slate-500">
                Las conversaciones que guardes aparecerán aquí
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => {
              const Icon = modeIcons[conv.mode] || MessageCircle;
              const gradient = modeColors[conv.mode] || 'from-slate-400 to-slate-500';

              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="bg-white/70 backdrop-blur-sm border-white/50 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 mb-1 truncate">
                            {conv.title || 'Conversación sin título'}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                            <span>{formatDate(conv.created_date)}</span>
                            <span>•</span>
                            <span>{conv.messages?.length || 0} mensajes</span>
                          </div>

                          {conv.topics_covered && conv.topics_covered.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {conv.topics_covered.slice(0, 3).map((topic, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-sky-100 text-sky-700 rounded-lg text-xs"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(createPageUrl('Chat') + `?conversationId=${conv.id}`)}
                            className="rounded-full text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                            title="Continuar conversación"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(conv.id)}
                            className="rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}