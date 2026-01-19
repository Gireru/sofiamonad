import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, BookOpen, Palette, MessageCircle, Camera } from 'lucide-react';

const activityIcons = {
  tutor: { icon: BookOpen, color: 'bg-green-500', label: 'Tarea' },
  creative: { icon: Palette, color: 'bg-purple-500', label: 'Creatividad' },
  free: { icon: MessageCircle, color: 'bg-orange-500', label: 'Recreo' },
  scan: { icon: Camera, color: 'bg-blue-500', label: 'Escáner' }
};

export default function LearningTimeline({ activities = [] }) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <Clock className="w-5 h-5" />
          Resumen de Aprendizaje
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, i) => {
              const config = activityIcons[activity.mode] || activityIcons.tutor;
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-3"
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {i < activities.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 my-1" />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-600">{activity.time}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                        {config.label}
                      </span>
                    </div>
                    <p className="text-slate-800">{activity.description}</p>
                    {activity.subject && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs">
                        {activity.subject}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Sin actividad hoy</p>
            <p className="text-sm">Las actividades aparecerán aquí cuando el estudiante use Sofia</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}