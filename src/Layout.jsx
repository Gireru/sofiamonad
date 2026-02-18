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
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="fixed top-0 left-0 right-0 z-50 p-2"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.02, 1],
                boxShadow: [
                  "0 10px 30px rgba(245, 158, 11, 0.3)",
                  "0 15px 40px rgba(245, 158, 11, 0.5)",
                  "0 10px 30px rgba(245, 158, 11, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="max-w-4xl mx-auto bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-2xl p-3 sm:p-4 border-2 border-amber-300 shadow-2xl"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                >
                  <span className="text-2xl sm:text-3xl">🔧</span>
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <motion.p
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="font-black text-white text-xs sm:text-base"
                  >
                    ⚡ MANTENIMIENTO PROGRAMADO ⚡
                  </motion.p>
                  <p className="text-amber-50 text-xs sm:text-sm font-medium truncate">
                    Nueva actualización IA - 20 Feb 2026, 3:00 PM
                  </p>
                </div>
                
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
                >
                  <span className="text-xl sm:text-2xl">✨</span>
                </motion.div>

                <button
                  onClick={() => setShowMaintenance(false)}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  <span className="text-white text-sm font-bold">✕</span>
                </button>
              </div>
            </motion.div>
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