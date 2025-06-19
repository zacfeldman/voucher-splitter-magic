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

type AppStep = 'landing' | 'validate' | 'split' | 'results' | 'balance';

// Vite provides import.meta.env for environment variables
const isTestMode = import.meta.env.VITE_TEST_MODE === 'true';

const VoucherSplitApp: React.FC = () => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

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

  return (
    <div className="min-h-screen py-8 px-4">
      <TopNavBar currentStep={currentStep} onNavigate={handleNavigate} />
      <div className="container mx-auto">
        {/* Progress Indicator - Only show when not on landing or balance */}
        {currentStep !== 'landing' && currentStep !== 'balance' && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium bg-green-600 text-white">
                1
              </div>
              <div className={`h-1 w-16 ${currentStep === 'split' || currentStep === 'results' ? 'bg-green-600' : 'bg-gray-300'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep === 'split' ? 'bg-blue-600 text-white' : 
                currentStep === 'results' ? 'bg-green-600 text-white' : 'bg-gray-300'
              }`}>
                2
              </div>
              <div className={`h-1 w-16 ${currentStep === 'results' ? 'bg-green-600' : 'bg-gray-300'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep === 'results' ? 'bg-green-600 text-white' : 'bg-gray-300'
              }`}>
                3
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        {loadingAuth && !isTestMode ? (
          <div className="text-center text-lg text-blue-600 mt-10">
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
            voucherPin={voucherPin}
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
      </div>
    </div>
  );
};

export default VoucherSplitApp;
