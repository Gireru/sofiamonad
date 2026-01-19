import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Users, BookOpen } from 'lucide-react';

export default function AcademicAlerts({ alerts = [] }) {
  const defaultAlerts = [
    {
      type: 'difficulty',
      icon: AlertCircle,
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      title: 'Tema Difícil Detectado',
      message: '5 alumnos han preguntado mucho sobre "Fracciones equivalentes" hoy.',
      action: 'Enviar repaso'
    },
    {
      type: 'trending',
      icon: TrendingUp,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      title: 'Tema Popular',
      message: 'El "Ciclo del Agua" ha sido el tema más estudiado esta semana.',
      action: 'Ver detalles'
    },
    {
      type: 'engagement',
      icon: Users,
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      title: 'Participación Alta',
      message: '8 de 10 alumnos completaron la misión de "Benito Juárez".',
      action: 'Ver resultados'
    }
  ];

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts;

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <BookOpen className="w-5 h-5" />
          Alertas Académicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayAlerts.map((alert, i) => {
          const Icon = alert.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`${alert.bgColor} rounded-xl p-4 border border-${alert.type === 'difficulty' ? 'orange' : alert.type === 'trending' ? 'green' : 'blue'}-200`}
            >
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${alert.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${alert.textColor} mb-1`}>{alert.title}</h4>
                  <p className={`text-sm ${alert.textColor} mb-3`}>{alert.message}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg text-xs"
                  >
                    {alert.action}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}