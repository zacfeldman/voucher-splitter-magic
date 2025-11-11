import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNavBar from './TopNavBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{ phone: string } | null>(null);

  // Extract current step from pathname
  const currentStep = location.pathname.replace(/^\//, '') || 'landing';

  // Handle profile actions (mock implementation)
  const handleProfileAction = (action: 'edit' | 'logout') => {
    if (action === 'logout') {
      setUser(null);
      localStorage.removeItem('currentUser');
    }
  };

  // Initialize user from localStorage and listen for updates
  useEffect(() => {
    try {
      const current = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (current && current.phone) setUser(current);
    } catch (e) {
      // ignore
    }

    const handler = (e: any) => {
      try {
        if (e?.detail) setUser(e.detail);
        else {
          const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
          setUser(cur);
        }
      } catch { }
    };
    window.addEventListener('user-updated', handler as EventListener);
    return () => window.removeEventListener('user-updated', handler as EventListener);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden" style={{background: 'linear-gradient(120deg, #3B4CB8 0%, #A23BA3 60%, #E13CA0 100%)'}}>
      {/* SVG Wavy Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg" style={{zIndex: 1}}>
        <path d="M0,400 Q360,300 720,400 T1440,400 V600 H0 Z" fill="#fff" fillOpacity="0.04" />
        <path d="M0,350 Q360,250 720,350 T1440,350" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" fill="none" />
        <path d="M0,500 Q360,450 720,500 T1440,500" stroke="#fff" strokeOpacity="0.08" strokeWidth="2" fill="none" />
      </svg>
      <div className="relative z-10 flex flex-col min-h-screen">
        <TopNavBar 
          currentStep={currentStep} 
          onNavigate={(step) => navigate(`/${step === 'landing' ? '' : step}`)}
          user={user}
          onProfileAction={handleProfileAction}
        />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;