import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SplashScreen from '@/components/splash/SplashScreen';

export default function Layout({ children, currentPageName }) {
  const [showSplash, setShowSplash] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(true);

  useEffect(() => {
    // Mostrar splash solo en la primera carga
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (!hasSeenSplash) {
      setShowSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  // Pages that should NOT have the layout wrapper (full-screen experiences)
  const fullScreenPages = ['Home', 'Onboarding', 'Chat', 'Dashboard', 'Settings', 'ParentDashboard', 'TeacherDashboard', 'ParentLogin', 'TeacherLogin'];
  
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }
  
  if (fullScreenPages.includes(currentPageName)) {
    return (
      <>
        {showMaintenance && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 shadow-sm"
          >
            <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">🔧</span>
                </div>
                <p className="text-sm text-amber-900 font-medium">
                  Mantenimiento programado: <span className="font-semibold">20 Feb 2026, 3:00 PM</span> · Nueva actualización IA
                </p>
              </div>
              
              <button
                onClick={() => setShowMaintenance(false)}
                className="w-5 h-5 rounded hover:bg-amber-200 flex items-center justify-center flex-shrink-0 transition-colors text-amber-700 hover:text-amber-900"
              >
                <span className="text-sm">✕</span>
              </button>
            </div>
          </motion.div>
        )}
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      {children}
    </div>
  );
}