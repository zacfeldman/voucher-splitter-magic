import React, { useState, useEffect } from 'react';
import VoucherValidator from './VoucherValidator';
import VoucherSplitter from './VoucherSplitter';
import SplitResults from './SplitResults';
import VoucherBalanceChecker from './VoucherBalanceChecker';
import LandingPage from './LandingPage';
import TopNavBar from './TopNavBar';
import { ValidateVoucherResponse, VariableVoucherVendJsonResponse } from '@/types/voucher';
import { fetchAuthToken } from '@/services/voucherApi';
import { toast } from '@/hooks/use-toast';
import VoucherHistory from './VoucherHistory';
import Login from './Login';
import Register from './Register';

type AppStep = 'landing' | 'validate' | 'split' | 'results' | 'balance' | 'history' | 'login' | 'purchase';

// Vite provides import.meta.env for environment variables
const isTestMode = import.meta.env.VITE_TEST_MODE === 'true';

const VoucherSplitApp: React.FC = () => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [user, setUser] = useState<{ phone: string } | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  // Persist login state
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogin = (user: { phone: string }) => {
    setUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setShowRegister(false);
  };
  const handleRegister = (user: { phone: string }) => {
    setUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setShowRegister(false);
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  useEffect(() => {
    const getAuthToken = async () => {
      try {
        const token = await fetchAuthToken();
        setAuthToken(token);
      } catch (error) {
        console.error("Failed to fetch authentication token:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to get API access token. Check console for details.",
          variant: "destructive",
        });
      } finally {
        setLoadingAuth(false);
      }
    };

    if (!isTestMode) {
      getAuthToken();
    } else {
      setLoadingAuth(false);
    }
  }, [isTestMode]);

  // Use test mode if enabled, otherwise start in normal mode
  const [currentStep, setCurrentStep] = useState<AppStep>('landing');
  const [validatedVoucher, setValidatedVoucher] = useState<ValidateVoucherResponse | null>(
    isTestMode
      ? {
          SerialNumber: "BL016C1E46AD2768",
          VoucherStatus: "Active",
          ValueCents: 10000, // R100.00
          VoucherCanBeSplit: true
        }
      : null
  );
  const [voucherPin, setVoucherPin] = useState<string>(isTestMode ? '1234567890' : '');
  const [splitVouchers, setSplitVouchers] = useState<VariableVoucherVendJsonResponse[]>([]);

  const handleVoucherValidated = (voucher: ValidateVoucherResponse, pin: string) => {
    setValidatedVoucher(voucher);
    setVoucherPin(pin);
    setCurrentStep('split');
  };

  const handleSplitComplete = (vouchers: VariableVoucherVendJsonResponse[]) => {
    setSplitVouchers(vouchers);
    setCurrentStep('results');
    // Save to history in localStorage
    const history = JSON.parse(localStorage.getItem('voucherHistory') || '[]');
    const newHistory = [...history, ...vouchers.map(v => ({ ...v, splitAt: new Date().toISOString() }))];
    localStorage.setItem('voucherHistory', JSON.stringify(newHistory));
  };

  const handleStartOver = () => {
    if (isTestMode) {
      setCurrentStep('split');
      setValidatedVoucher({
        SerialNumber: "BL016C1E46AD2768",
        VoucherStatus: "Active",
        ValueCents: 10000, // R100.00
        VoucherCanBeSplit: true
      });
      setVoucherPin('1234567890');
      setSplitVouchers([]);
    } else {
      setCurrentStep('validate');
      setValidatedVoucher(null);
      setVoucherPin('');
      setSplitVouchers([]);
    }
  };

  // Navigation logic for menu and back buttons
  const handleNavigate = (step: AppStep) => {
    setCurrentStep(step);
  };

  // Back button logic for each screen
  const handleBack = () => {
    if (currentStep === 'split') {
      setCurrentStep('validate');
    } else if (currentStep === 'results') {
      setCurrentStep('split');
    } else if (currentStep === 'validate') {
      setCurrentStep('landing');
    } else {
      setCurrentStep('landing');
    }
  };

  const handleGoToBalance = () => {
    setCurrentStep('balance');
  };

  const handleStartSplit = () => {
    setCurrentStep(isTestMode ? 'split' : 'validate');
  };

  // Only require login for history and saving splits
  const [requireAuth, setRequireAuth] = useState(false);

  // Show login/register only if requireAuth is true and not logged in
  useEffect(() => {
    if (currentStep === 'history' && !user) {
      setRequireAuth(true);
    } else {
      setRequireAuth(false);
    }
  }, [currentStep, user]);

  // Add state for showing edit profile modal (placeholder for now)
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleProfileAction = (action: 'edit' | 'logout') => {
    if (action === 'logout') {
      handleLogout();
    } else if (action === 'edit') {
      setShowEditProfile(true);
    }
  };

  // Show login/register if currentStep is 'login' (from nav) or requireAuth is true and not logged in
  if ((currentStep === 'login' || (requireAuth && !user))) {
    return showRegister ? (
      <Register onRegister={(user) => { handleRegister(user); setCurrentStep('landing'); }} onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={(user) => { handleLogin(user); setCurrentStep('landing'); }} onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden" style={{background: 'linear-gradient(120deg, #3B4CB8 0%, #A23BA3 60%, #E13CA0 100%)'}}>
      {/* SVG Wavy Overlay - global */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg" style={{zIndex: 1}}>
        <path d="M0,400 Q360,300 720,400 T1440,400 V600 H0 Z" fill="#fff" fillOpacity="0.04" />
        <path d="M0,350 Q360,250 720,350 T1440,350" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" fill="none" />
        <path d="M0,500 Q360,450 720,500 T1440,500" stroke="#fff" strokeOpacity="0.08" strokeWidth="2" fill="none" />
      </svg>
      <div className="relative z-10">
        {/* Main App UI - always available for splitting/validation */}
        <TopNavBar currentStep={currentStep} onNavigate={handleNavigate} user={user} onProfileAction={handleProfileAction} />
        <div className="container mx-auto">
          {/* Progress Indicator - Only show when not on landing, balance, or history */}
          {currentStep !== 'landing' && currentStep !== 'balance' && currentStep !== 'history' && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium bg-pink-500 text-white">
                  1
                </div>
                <div className={`h-1 w-16 ${currentStep === 'split' || currentStep === 'results' ? 'bg-pink-500' : 'bg-white/40'}`} />
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep === 'split' ? 'bg-blue-600 text-white' : 
                    currentStep === 'results' ? 'bg-pink-500 text-white' : 'bg-white/40 text-white'
                }`}>
                  2
                </div>
                <div className={`h-1 w-16 ${currentStep === 'results' ? 'bg-pink-500' : 'bg-white/40'}`} />
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep === 'results' ? 'bg-pink-500 text-white' : 'bg-white/40 text-white'
                }`}>
                  3
                </div>
              </div>
            </div>
          )}
          {/* Step Content */}
          {loadingAuth && !isTestMode ? (
            <div className="text-center text-lg text-white mt-10">
              Loading authentication...
            </div>
          ) : currentStep === 'landing' ? (
            <LandingPage onSplitVoucher={handleStartSplit} onCheckBalance={handleGoToBalance} />
          ) : currentStep === 'validate' && (
            <VoucherValidator onVoucherValidated={handleVoucherValidated} authToken={authToken} onBack={handleBack} />
          )}
          {currentStep === 'split' && validatedVoucher && (
            <VoucherSplitter
              validatedVoucher={validatedVoucher}
              voucherPin={voucherPin.replace(/\s+/g, '')}
              onSplitComplete={handleSplitComplete}
              onBack={handleBack}
              authToken={authToken}
            />
          )}
          {currentStep === 'results' && (
            <SplitResults
              splitVouchers={splitVouchers}
              onStartOver={handleStartOver}
              onBack={handleBack}
            />
          )}
          {currentStep === 'balance' && (
            <VoucherBalanceChecker onBack={handleBack} />
          )}
          {currentStep === 'history' && user && (
            <>
              <VoucherHistory />
            </>
          )}
        </div>
      </div>
      {/* Optionally, show edit profile modal here */}
      {showEditProfile && user && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
                const password = (form.elements.namedItem('password') as HTMLInputElement).value;
                const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;
                if (!/^\d{10,15}$/.test(phone)) {
                  alert('Please enter a valid cell phone number.');
                  return;
                }
                if (password && password.length < 6) {
                  alert('Password must be at least 6 characters.');
                  return;
                }
                if (password !== confirmPassword) {
                  alert('Passwords do not match.');
                  return;
                }
                // Update user in localStorage
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const idx = users.findIndex((u: any) => u.phone === user.phone);
                if (idx === -1) {
                  alert('User not found.');
                  return;
                }
                // Check for duplicate phone number
                if (phone !== user.phone && users.some((u: any) => u.phone === phone)) {
                  alert('A user with this phone number already exists.');
                  return;
                }
                users[idx].phone = phone;
                if (password) users[idx].password = password;
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify({ phone }));
                setUser({ phone });
                setShowEditProfile(false);
                alert('Profile updated successfully!');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block mb-1 font-medium">Cell Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full border rounded px-3 py-2"
                  defaultValue={user.phone}
                  required
                  pattern="[0-9]{10,15}"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  name="password"
                  className="w-full border rounded px-3 py-2"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="w-full border rounded px-3 py-2"
                  minLength={6}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded font-bold">Save</button>
                <button type="button" className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-bold" onClick={() => setShowEditProfile(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherSplitApp;
