import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function MissionBroadcast({ studentCount = 0, onSendMission }) {
  const [mission, setMission] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!mission.trim()) return;
    
    setSending(true);
    try {
      await onSendMission?.(mission);
      toast.success(`Misión enviada a ${studentCount} estudiantes`);
      setMission('');
    } catch (error) {
      toast.error('Error al enviar la misión');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <Send className="w-5 h-5" />
          Enviar Misión
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-700 mb-2">
            <Sparkles className="w-4 h-4" />
            <p className="text-sm font-medium">¿Cómo funciona?</p>
          </div>
          <p className="text-xs text-emerald-600">
            Cuando los alumnos abran Sofia, Lia/Leo les dirá: "¡Tu profe mandó una misión especial! ¿Empezamos?"
          </p>
        </div>

        <Textarea
          placeholder="Ejemplo: Investigar quién fue Benito Juárez y escribir 3 datos importantes"
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          className="min-h-[100px] resize-none"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="w-4 h-4" />
            <span>Enviar a {studentCount} estudiante{studentCount !== 1 ? 's' : ''}</span>
          </div>
          <Button
            onClick={handleSend}
            disabled={!mission.trim() || sending || studentCount === 0}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            {sending ? 'Enviando...' : 'Enviar a Todos'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}