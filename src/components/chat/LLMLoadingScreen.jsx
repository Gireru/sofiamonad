import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function LLMLoadingScreen({ status, progress, progressText, onRetry }) {
  const isDownloading = status === 'downloading';
  const isError = status === 'error';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center space-y-6"
      >
        {/* Icono animado */}
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
              Asegúrate de tener suficiente espacio y memoria disponible.
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
                {isDownloading ? 'Descargando Sofia IA...' : 'Iniciando Sofia...'}
              </h2>
              <p className="text-slate-500 text-sm">
                {isDownloading
                  ? 'Primera vez: descargando el modelo (~300 MB). Después funciona sin internet. 📶'
                  : 'Cargando el modelo en memoria...'}
              </p>
            </div>

            {/* Barra de progreso */}
            <div className="space-y-2">
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <p className="text-xs text-slate-400 truncate">{progressText || 'Preparando...'}</p>
              <p className="text-3xl font-bold text-indigo-600">{progress}%</p>
            </div>

            {isDownloading && (
              <div className="bg-sky-50 rounded-2xl p-4 space-y-2 text-left">
                <p className="text-xs font-semibold text-sky-700">💡 Consejos:</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Conéctate a WiFi para descargar más rápido</li>
                  <li>• Una vez descargado, funciona sin internet</li>
                  <li>• Compatible con Android, iPhone y tablets</li>
                </ul>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}