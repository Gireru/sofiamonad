import React from 'react';
import { motion } from 'framer-motion';
import Avatar3D, { avatarConfigs } from '../avatars/Avatar3D';

export default function AvatarSelector({ selected, onSelect }) {
  const avatarTypes = Object.keys(avatarConfigs);

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-slate-700 text-center">
        ¡Elige a tu compañero de aventuras! ✨
      </h2>
      
      <div className="flex flex-wrap justify-center gap-8">
        {avatarTypes.map((type) => (
          <motion.button
            key={type}
            onClick={() => onSelect(type)}
            className={`
              relative p-4 rounded-3xl transition-all duration-300
              ${selected === type 
                ? 'bg-gradient-to-br from-sky-100 to-blue-100 ring-4 ring-sky-400 shadow-xl' 
                : 'bg-white/60 hover:bg-white/80 shadow-lg hover:shadow-xl'}
            `}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar3D 
              type={type} 
              size="lg" 
              state={selected === type ? 'idle' : 'idle'} 
            />
            
            <p className={`
              mt-4 font-semibold text-center
              ${selected === type ? 'text-sky-600' : 'text-slate-600'}
            `}>
              {avatarConfigs[type].name}
            </p>
            
            {selected === type && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white shadow-lg"
              >
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}