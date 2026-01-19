import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Avatar3D from '../avatars/Avatar3D';
import { Sparkles, Heart, Zap } from 'lucide-react';

const personalityOptions = [
  {
    id: 'lia',
    name: 'Lia',
    description: 'Dulce, creativa y paciente',
    icon: Heart,
    color: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-50 hover:bg-pink-100 border-pink-200'
  },
  {
    id: 'leo',
    name: 'Leo',
    description: 'Enérgico, explorador y divertido',
    icon: Zap,
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
  }
];

export default function CompanionNamer({ 
  avatarType, 
  selectedPersonality, 
  customName,
  onPersonalitySelect, 
  onCustomNameChange 
}) {
  const [useCustom, setUseCustom] = useState(false);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">
          ¿Cómo se llamará tu compañero? 🎭
        </h2>
        <p className="text-slate-500">
          Elige una personalidad o ponle un nombre especial
        </p>
      </div>

      <Avatar3D type={avatarType} size="xl" state="idle" />

      {/* Personality options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        {personalityOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedPersonality === option.id && !useCustom;
          
          return (
            <motion.button
              key={option.id}
              onClick={() => {
                setUseCustom(false);
                onPersonalitySelect(option.id);
                onCustomNameChange(option.name);
              }}
              className={`
                relative p-5 rounded-2xl border-2 transition-all text-left
                ${isSelected 
                  ? 'border-sky-400 bg-sky-50 shadow-lg shadow-sky-200/50' 
                  : option.bgColor}
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-700">{option.name}</span>
              </div>
              <p className="text-sm text-slate-500">{option.description}</p>
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-sky-400 rounded-full flex items-center justify-center text-white text-sm"
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 w-full max-w-md">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-slate-400 text-sm">o</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Custom name option */}
      <motion.div 
        className={`
          w-full max-w-md p-5 rounded-2xl border-2 transition-all
          ${useCustom 
            ? 'border-purple-400 bg-purple-50 shadow-lg shadow-purple-200/50' 
            : 'bg-white/60 border-slate-200 hover:border-purple-300'}
        `}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-700">¡Ponle nombre tú mismo!</span>
        </div>
        
        <Input
          placeholder="Escribe un nombre especial..."
          value={useCustom ? customName : ''}
          onChange={(e) => {
            setUseCustom(true);
            onPersonalitySelect('custom');
            onCustomNameChange(e.target.value);
          }}
          onFocus={() => {
            setUseCustom(true);
            onPersonalitySelect('custom');
          }}
          className="bg-white border-purple-200 focus:border-purple-400 rounded-xl text-lg"
        />
      </motion.div>
    </div>
  );
}