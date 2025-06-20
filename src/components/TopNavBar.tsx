import React from 'react';

interface TopNavBarProps {
  currentStep: string;
  onNavigate: (step: string) => void;
}

const navItems = [
  { label: 'Home', step: 'landing' },
  { label: 'Split Voucher', step: 'validate' },
  { label: 'Check Balance', step: 'balance' },
  { label: 'History', step: 'history' },
];

const TopNavBar: React.FC<TopNavBarProps> = ({ currentStep, onNavigate }) => {
  return (
    <nav className="w-full bg-white/70 backdrop-blur-md shadow-md mb-8 border-b border-pink-500">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onNavigate('landing')}> 
          <div className="bg-white rounded-2xl shadow-2xl px-4 py-2 flex items-center" style={{minWidth: 120, maxWidth: 180}}>
            <img src="/blu-voucher-logo.png" alt="Blu Voucher Logo" className="h-8 w-auto" />
          </div>
        </div>
        <div className="flex gap-2">
          {navItems.map(item => (
            <button
              key={item.step}
              className={`px-4 py-2 rounded-md font-semibold transition-colors font-sans text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${currentStep === item.step ? 'text-pink-500 underline underline-offset-8 decoration-4 decoration-pink-500 bg-white/90' : 'text-blue-900 hover:text-pink-500 hover:bg-white/80'}`}
              onClick={() => onNavigate(item.step)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar; 