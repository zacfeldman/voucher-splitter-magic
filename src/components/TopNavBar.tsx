import React from 'react';

interface TopNavBarProps {
  currentStep: string;
  onNavigate: (step: string) => void;
}

const navItems = [
  { label: 'Home', step: 'landing' },
  { label: 'Split Voucher', step: 'validate' },
  { label: 'Check Balance', step: 'balance' },
];

const TopNavBar: React.FC<TopNavBarProps> = ({ currentStep, onNavigate }) => {
  return (
    <nav className="w-full bg-white shadow-sm mb-8">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <div className="text-xl font-bold text-blue-700 tracking-wide cursor-pointer" onClick={() => onNavigate('landing')}>
          Blue Label Vouchers
        </div>
        <div className="flex gap-4">
          {navItems.map(item => (
            <button
              key={item.step}
              className={`px-3 py-1 rounded transition font-medium ${currentStep === item.step ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-100'}`}
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