import React from 'react';

export default function Layout({ children, currentPageName }) {
  // Pages that should NOT have the layout wrapper (full-screen experiences)
  const fullScreenPages = ['Onboarding', 'Chat', 'Dashboard', 'Settings', 'ParentDashboard', 'TeacherDashboard'];
  
  if (fullScreenPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      {children}
    </div>
  );
}