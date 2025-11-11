import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TopNavBarProps {
  currentStep?: string;
  onNavigate?: (step: string) => void;
  user?: { phone: string } | null;
  onProfileAction?: (action: 'edit' | 'logout') => void;
}

const navItems = [
  { label: 'Home', step: 'landing' },
  { 
    label: 'Redeem Voucher', 
    step: 'redeem',
    dropdown: [
      { label: 'General Redeem', step: 'redeem' },
      { label: 'Airtime', step: 'airtime' },
      { label: 'Electricity', step: 'electricity' },
      { label: 'Betway', step: 'betway' },
    ]
  },
  { label: 'Split Voucher', step: 'validate' },
  { label: 'Check Voucher', step: 'balance' },
  { label: 'Purchase Voucher', step: 'purchase' },
  { label: 'History', step: 'history' },
];

const UserIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle">
    <circle cx="12" cy="8" r="4" strokeWidth="2" />
    <path strokeWidth="2" d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4" />
  </svg>
);

import { useLocation } from 'react-router-dom';
import AddFundsDialog from './AddFundsDialog';

const TopNavBar: React.FC<TopNavBarProps> = ({ currentStep: currentStepProp, onNavigate, user, onProfileAction }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // derive a simple step from pathname if not provided
  const path = location?.pathname || '/';
  const derivedStep = path === '/' ? 'landing' : path.replace(/^\//, '').split('/')[0];
  const currentStep = currentStepProp || derivedStep;
  const [profileOpen, setProfileOpen] = useState(false);

  const handleProfileClick = () => setProfileOpen((open) => !open);
  const handleProfileAction = (action: 'edit' | 'logout') => {
    setProfileOpen(false);
    if (onProfileAction) onProfileAction(action);
  };

  return (
    // ensure nav (and its dropdowns) sit above the page overlay
    <nav className="w-full bg-white/70 backdrop-blur-md shadow-md mb-4 border-b border-pink-500 z-20 overflow-visible">
      <div className="container mx-auto flex items-center justify-between py-3 px-4 overflow-visible">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onNavigate('landing')}> 
          <div className="bg-white rounded-2xl shadow-2xl px-4 py-1 flex items-center" style={{minWidth: 120, maxWidth: 180}}>
            <img src="/blu-voucher-logo.png" alt="Blu Voucher Logo" className="h-8 w-auto" />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {navItems.map(item => (
            <div key={item.step} className="relative group">
              <button
                className={`px-4 py-2 rounded-md font-semibold transition-colors font-sans text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${currentStep === item.step ? 'text-pink-500 underline underline-offset-8 decoration-4 decoration-pink-500 bg-white/90' : 'text-blue-900 hover:text-pink-500 hover:bg-white/80'}`}
                onClick={() => {
                  if (!item.dropdown) {
                    // prefer react-router navigation so pages have their own URLs
                    if (onNavigate) onNavigate(item.step);
                    if (item.step === 'landing') navigate('/');
                    if (item.step === 'validate') navigate('/split');
                    if (item.step === 'balance') navigate('/check');
                    if (item.step === 'purchase') navigate('/purchase');
                    if (item.step === 'history') navigate('/history');
                    if (item.step === 'redeem') navigate('/redeem');
                  }
                }}
              >
                {item.label}
                {item.dropdown && (
                  <svg className="w-4 h-4 ml-1 inline-block" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
              {item.dropdown && (
                <div className="absolute hidden group-hover:block mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50">
                  <div className="py-1">
                    {item.dropdown.map(subItem => (
                      <button
                        key={subItem.step}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500"
                        onClick={() => {
                          if (onNavigate) onNavigate(subItem.step);
                          navigate(`/${subItem.step}`);
                        }}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div>{user.phone}</div>
                    {typeof (user as any).wallet !== 'undefined' && (
                      <div className="text-xs text-gray-500 mt-1">Balance: {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(((user as any).wallet || 0) / 100)}</div>
                    )}
                  </div>
                  <div className="px-2">
                    <AddFundsDialog />
                  </div>
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