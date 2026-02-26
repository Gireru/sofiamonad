import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SplashScreen from '@/components/splash/SplashScreen';

export default function Layout({ children, currentPageName }) {
  const [showSplash, setShowSplash] = useState(false);

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
    return children;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      {children}
    </div>
  );
}