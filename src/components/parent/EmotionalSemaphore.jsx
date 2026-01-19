import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Meh, Frown, Sparkles } from 'lucide-react';

const sentiments = {
  happy: {
    emoji: '😊',
    label: 'Alegre y Motivado',
    color: 'from-green-400 to-emerald-500',
    icon: Smile,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  neutral: {
    emoji: '😐',
    label: 'Tranquilo',
    color: 'from-yellow-400 to-amber-500',
    icon: Meh,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700'
  },
  frustrated: {
    emoji: '😞',
    label: 'Frustrado',
    color: 'from-orange-400 to-red-500',
    icon: Frown,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700'
  }
};

export default function EmotionalSemaphore({ studentName = 'el estudiante', sentiment = 'happy', details = '' }) {
  const current = sentiments[sentiment] || sentiments.neutral;
  const Icon = current.icon;

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <Sparkles className="w-5 h-5" />
          Semáforo Emocional
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center shadow-xl`}
          >
            <span className="text-5xl">{current.emoji}</span>
          </motion.div>
          
          <div className="flex-1">
            <p className="text-sm text-slate-500 mb-1">Hoy {studentName} se sintió:</p>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{current.label}</h3>
            {details && (
              <div className={`${current.bgColor} rounded-xl p-3 border border-${sentiment === 'frustrated' ? 'orange' : sentiment === 'neutral' ? 'yellow' : 'green'}-200`}>
                <p className={`text-sm ${current.textColor}`}>
                  {details}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}