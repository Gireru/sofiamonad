import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Cpu, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function LocalLLMButton({ status, progress, progressText, onDownload }) {
  const configs = {
    idle: {
      icon: <Download className="w-4 h-4" />,
      label: 'Descargar IA sin internet',
      sublabel: 'Gemma 2 (~1.5 GB)',
      color: 'bg-violet-100 text-violet-700 border-violet-300 hover:bg-violet-200',
      clickable: true,
    },
    downloading: {
      icon: <Loader className="w-4 h-4 animate-spin" />,
      label: `Descargando... ${progress}%`,
      sublabel: progressText || 'Por favor espera',
      color: 'bg-sky-100 text-sky-700 border-sky-300',
      clickable: false,
    },
    loading: {
      icon: <Loader className="w-4 h-4 animate-spin" />,
      label: 'Iniciando modelo...',
      sublabel: 'Un momento',
      color: 'bg-amber-100 text-amber-700 border-amber-300',
      clickable: false,
    },
    ready: {
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'IA local activa',
      sublabel: 'Gemma 2 · Sin internet',
      color: 'bg-green-100 text-green-700 border-green-300',
      clickable: false,
    },
    error: {
      icon: <AlertCircle className="w-4 h-4" />,
      label: 'Error · Reintentar',
      sublabel: 'Toca para volver a intentar',
      color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
      clickable: true,
    },
  };

  const cfg = configs[status] || configs.idle;

  return (
    <AnimatePresence mode="wait">
      <motion.button
        key={status}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={cfg.clickable ? onDownload : undefined}
        disabled={!cfg.clickable}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${cfg.color} ${cfg.clickable ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <Cpu className="w-4 h-4 flex-shrink-0" />
        <div className="text-left leading-tight">
          <div className="flex items-center gap-1">
            {cfg.icon}
            <span>{cfg.label}</span>
          </div>
          <div className="text-xs opacity-70">{cfg.sublabel}</div>
        </div>

        {/* Progress bar */}
        {status === 'downloading' && (
          <div className="w-16 h-1.5 bg-sky-200 rounded-full overflow-hidden ml-1">
            <motion.div
              className="h-full bg-sky-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        )}
      </motion.button>
    </AnimatePresence>
  );
}