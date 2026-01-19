import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Phone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmotionalSupportMessage({ 
  companionName = 'Lia', 
  alertType = 'sadness',
  onDismiss 
}) {
  const messages = {
    sadness: {
      title: 'Noto que tal vez te sientes triste',
      message: `Soy ${companionName}, y estoy aquí para ti. ¿Quieres hablar sobre cómo te sientes? Recuerda que está bien pedir ayuda a personas de confianza.`,
      emoji: '💙',
      resources: [
        'Habla con tus papás o un adulto de confianza',
        'Los maestros también pueden ayudarte',
        'Tus sentimientos son importantes'
      ]
    },
    anxiety: {
      title: 'Parece que estás preocupado',
      message: `Respira profundo conmigo. Todos nos preocupamos a veces. Puedo ayudarte a organizar tus ideas, pero también es bueno hablar con alguien cercano.`,
      emoji: '🌟',
      resources: [
        'Respira: inhala 4, sostén 4, exhala 4',
        'Habla con alguien que te escuche',
        'Escribir tus pensamientos puede ayudar'
      ]
    }
  };

  const content = messages[alertType] || messages.sadness;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 border-2 border-blue-200 shadow-xl max-w-md mx-auto"
    >
      {/* Icon */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-3">
          <span className="text-4xl">{content.emoji}</span>
        </div>
        <h3 className="text-xl font-bold text-slate-800">{content.title}</h3>
      </div>

      {/* Message */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 mb-4">
        <p className="text-slate-700 leading-relaxed">{content.message}</p>
      </div>

      {/* Resources */}
      <div className="space-y-2 mb-4">
        {content.resources.map((resource, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
            <Heart className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
            <span>{resource}</span>
          </div>
        ))}
      </div>

      {/* Emergency info */}
      <div className="bg-red-50 rounded-xl p-3 mb-4 border border-red-100">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="text-xs text-red-700">
            <p className="font-medium mb-1">Si es una emergencia:</p>
            <p>Llama al <strong>911</strong> o habla inmediatamente con un adulto de confianza.</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onDismiss}
          className="flex-1 rounded-xl"
        >
          Entiendo
        </Button>
        <Button
          onClick={() => window.open('tel:911')}
          className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 gap-2"
        >
          <Phone className="w-4 h-4" />
          Ayuda
        </Button>
      </div>
    </motion.div>
  );
}