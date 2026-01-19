import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ 
  icon: Icon, 
  value, 
  label, 
  gradient,
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </motion.div>
  );
}