import React, { useState } from 'react';

interface TopNavBarProps {
  currentStep: string;
  onNavigate: (step: string) => void;
  user?: { phone: string } | null;
  onProfileAction?: (action: 'edit' | 'logout') => void;
}

const navItems = [
  { label: 'Home', step: 'landing' },
  { label: 'Split Voucher', step: 'validate' },
  { label: 'Check Balance', step: 'balance' },
  { label: 'Purchase Voucher', step: 'purchase' },
  { label: 'History', step: 'history' },
];

const UserIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle">
    <circle cx="12" cy="8" r="4" strokeWidth="2" />
    <path strokeWidth="2" d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4" />
  </svg>
);

const TopNavBar: React.FC<TopNavBarProps> = ({ currentStep, onNavigate, user, onProfileAction }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const handleProfileClick = () => setProfileOpen((open) => !open);
  const handleProfileAction = (action: 'edit' | 'logout') => {
    setProfileOpen(false);
    if (onProfileAction) onProfileAction(action);
  };

  return (
    <nav className="w-full bg-white/70 backdrop-blur-md shadow-md mb-8 border-b border-pink-500">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onNavigate('landing')}> 
          <div className="bg-white rounded-2xl shadow-2xl px-4 py-2 flex items-center" style={{minWidth: 120, maxWidth: 180}}>
            <img src="/blu-voucher-logo.png" alt="Blu Voucher Logo" className="h-8 w-auto" />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {navItems.map(item => (
            <button
              key={item.step}
              className={`px-4 py-2 rounded-md font-semibold transition-colors font-sans text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${currentStep === item.step ? 'text-pink-500 underline underline-offset-8 decoration-4 decoration-pink-500 bg-white/90' : 'text-blue-900 hover:text-pink-500 hover:bg-white/80'}`}
              onClick={() => onNavigate(item.step)}
            >
              {item.label}
            </button>
          ))}
          {user ? (
            <div className="relative">
              <button
                className="px-4 py-2 rounded-md font-semibold transition-colors font-sans text-base text-blue-900 hover:text-pink-500 hover:bg-white/80 bg-white/90 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                onClick={handleProfileClick}
                aria-haspopup="true"
                aria-expanded={profileOpen}
              >
                <UserIcon />
                <span>Profile</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 min-w-[12rem] bg-white border border-gray-200 rounded shadow-lg z-50 py-2" style={{minHeight: '120px'}}>
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">{user.phone}</div>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-pink-50" onClick={() => handleProfileAction('edit')}>Edit Profile</button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-pink-50" onClick={() => handleProfileAction('logout')}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button
              className={`px-4 py-2 rounded-md font-semibold transition-colors font-sans text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${currentStep === 'login' ? 'text-pink-500 underline underline-offset-8 decoration-4 decoration-pink-500 bg-white/90' : 'text-blue-900 hover:text-pink-500 hover:bg-white/80'}`}
              onClick={() => onNavigate('login')}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar; 