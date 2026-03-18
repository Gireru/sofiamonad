import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function LLMLoadingScreen({ status, progress, progressText, onRetry }) {
  const isDownloading = status === 'downloading';
  const isLoading = status === 'loading';
  const isError = status === 'error';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center space-y-6"
      >
        {/* Animated brain icon */}
        <motion.div
          animate={isError ? {} : { scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-xl"
        >
          <span className="text-5xl">{isError ? '⚠️' : '🧠'}</span>
        </motion.div>

        {isError ? (
          <>
            <h2 className="text-xl font-bold text-slate-800">No se pudo cargar la IA</h2>
            <p className="text-slate-500 text-sm">
              Asegúrate de tener suficiente memoria disponible e intenta de nuevo.
            </p>
            <Button
              onClick={onRetry}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl py-4"
            >
              Reintentar
            </Button>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">
                {isDownloading ? 'Descargando IA...' : 'Iniciando IA...'}
              </h2>
              <p className="text-slate-500 text-sm">
                {isDownloading
                  ? 'Primera vez: descargando Gemma 2 (~1.5 GB). Solo ocurre una vez.'
                  : 'Cargando el modelo en memoria...'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <p className="text-xs text-slate-400 truncate">{progressText || 'Iniciando...'}</p>
              <p className="text-2xl font-bold text-indigo-600">{progress}%</p>
            </div>

            {isDownloading && (
              <p className="text-xs text-slate-400">
                💡 Conecta a WiFi para una descarga más rápida. Una vez descargado, funciona sin internet.
              </p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}