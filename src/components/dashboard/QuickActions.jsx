import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen, Palette, MessageCircle, Camera, ShoppingBag, Settings, GraduationCap } from 'lucide-react';

const actions = [
  {
    id: 'tutor',
    icon: BookOpen,
    label: 'Ayuda con tarea',
    description: 'Tu tutor personal',
    gradient: 'from-green-400 to-emerald-500',
    page: 'Chat',
    params: '?mode=tutor'
  },
  {
    id: 'exam',
    icon: GraduationCap,
    label: 'Estudiar para examen',
    description: 'Repasa tus libros',
    gradient: 'from-indigo-400 to-violet-500',
    page: 'Chat',
    params: '?mode=exam'
  },
  {
    id: 'creative',
    icon: Palette,
    label: 'Zona Creativa',
    description: 'Crea dibujos e ideas',
    gradient: 'from-purple-400 to-pink-500',
    page: 'Chat',
    params: '?mode=creative'
  },
  {
    id: 'free',
    icon: MessageCircle,
    label: 'Recreo',
    description: 'Platica libre',
    gradient: 'from-orange-400 to-amber-500',
    page: 'Chat',
    params: '?mode=free'
  },
  {
    id: 'scan',
    icon: Camera,
    label: 'Escanear tarea',
    description: 'Foto de pregunta',
    gradient: 'from-blue-400 to-cyan-500',
    page: 'Chat',
    params: '?homework=true'
  },
  {
    id: 'shop',
    icon: ShoppingBag,
    label: 'Tienda',
    description: 'Compra accesorios',
    gradient: 'from-yellow-400 to-orange-500',
    page: 'Shop',
    params: ''
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Configuración',
    description: 'Ajusta tu perfil',
    gradient: 'from-slate-400 to-slate-500',
    page: 'Settings',
    params: ''
  }
];

export default function QuickActions({ studentGrade }) {
  // Determinar si es de 1° a 3° de primaria
  const isEarlyGrade = ['1_primaria', '2_primaria', '3_primaria'].includes(studentGrade);
  
  // Acciones básicas para 1° a 3° primaria
  const basicActionsIds = ['tutor', 'exam', 'creative', 'free', 'shop'];
  
  // Filtrar acciones según el grado
  const filteredActions = isEarlyGrade 
    ? actions.filter(action => basicActionsIds.includes(action.id))
    : actions;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {filteredActions.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={createPageUrl(action.page) + action.params}>
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="font-bold text-slate-800 mb-1">{action.label}</h3>
                <p className="text-xs text-slate-500">{action.description}</p>
              </motion.div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}