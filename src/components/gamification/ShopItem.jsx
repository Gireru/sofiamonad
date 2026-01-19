import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Lock } from 'lucide-react';

export default function ShopItem({ item, owned, equipped, onBuy, onEquip, canAfford }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`bg-white rounded-2xl p-4 border-2 shadow-lg transition-all ${
        equipped 
          ? 'border-sky-400 shadow-sky-400/30' 
          : owned 
          ? 'border-green-200' 
          : 'border-slate-200'
      }`}
    >
      {/* Item visual */}
      <div className={`w-full aspect-square rounded-xl flex items-center justify-center mb-3 ${
        equipped ? 'bg-gradient-to-br from-sky-100 to-indigo-100' : 'bg-slate-50'
      }`}>
        <span className="text-5xl">{item.emoji}</span>
      </div>

      {/* Item info */}
      <h3 className="font-bold text-slate-800 text-center mb-1">{item.name}</h3>
      
      {/* Price or status */}
      {equipped ? (
        <div className="bg-sky-100 text-sky-700 rounded-full py-1.5 text-xs font-medium text-center">
          ✨ Equipado
        </div>
      ) : owned ? (
        <Button
          onClick={onEquip}
          variant="outline"
          className="w-full rounded-xl text-xs"
        >
          Equipar
        </Button>
      ) : (
        <Button
          onClick={onBuy}
          disabled={!canAfford}
          className={`w-full rounded-xl text-xs gap-1 ${
            canAfford 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
              : 'bg-slate-300'
          }`}
        >
          {canAfford ? (
            <>
              <Sparkles className="w-3 h-3" />
              {item.cost} 🧠
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              {item.cost} 🧠
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
}