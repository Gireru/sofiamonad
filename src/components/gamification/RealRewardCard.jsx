import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const categoryColors = {
  bag: 'from-amber-400 to-orange-400',
  supplies: 'from-sky-400 to-blue-500',
  trip: 'from-green-400 to-emerald-500',
};

export default function RealRewardCard({ reward, neuronas, redeemed, onRedeem }) {
  const canAfford = neuronas >= reward.cost;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-2xl p-4 shadow-md border-2 flex flex-col gap-3 ${
        redeemed ? 'border-green-300' : canAfford ? 'border-amber-200' : 'border-slate-100'
      }`}
    >
      {/* Emoji + badge */}
      <div className="flex items-start justify-between">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${categoryColors[reward.category]} flex items-center justify-center text-3xl shadow`}>
          {reward.emoji}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          reward.category === 'trip' ? 'bg-green-100 text-green-700' :
          reward.category === 'bag' ? 'bg-amber-100 text-amber-700' :
          'bg-sky-100 text-sky-700'
        }`}>
          {reward.label}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1">
        <p className="font-bold text-slate-800 text-sm">{reward.name}</p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{reward.description}</p>
      </div>

      {/* Cost + action */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1 text-sm font-bold text-purple-700">
          <span>🔷</span>
          <span>{reward.cost.toLocaleString()}</span>
        </div>

        {redeemed ? (
          <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Solicitado
          </div>
        ) : (
          <Button
            size="sm"
            onClick={onRedeem}
            disabled={!canAfford}
            className={`rounded-full text-xs px-3 h-7 ${
              canAfford
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {canAfford ? 'Canjear' : 'Faltan ' + (reward.cost - neuronas).toLocaleString() + ' 🔷'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}