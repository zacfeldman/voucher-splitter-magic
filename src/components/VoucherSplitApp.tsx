import React, { useState, useEffect } from 'react';
import VoucherValidator from './VoucherValidator';
import VoucherSplitter from './VoucherSplitter';
import SplitResults from './SplitResults';
import { ValidateVoucherResponse, VariableVoucherVendJsonResponse } from '@/types/voucher';
import { fetchAuthToken } from '@/services/voucherApi';
import { toast } from '@/hooks/use-toast';

type AppStep = 'validate' | 'split' | 'results';

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
  const [currentStep, setCurrentStep] = useState<AppStep>(isTestMode ? 'split' : 'validate');
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

  const handleBack = () => {
    setCurrentStep(isTestMode ? 'split' : 'validate');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Blue Label Voucher Splitter
          </h1>
          <p className="text-xl text-muted-foreground">
            Split your vouchers into smaller denominations with ease
          </p>
          {isTestMode && (
            <p className="text-sm text-orange-600 mt-2">
              Testing Mode: Using mock R100 voucher
            </p>
          )}
        </div>

        {/* Progress Indicator - Modified for testing */}
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

        {/* Step Content */}
        {loadingAuth && !isTestMode ? (
          <div className="text-center text-lg text-blue-600 mt-10">
            Loading authentication...
          </div>
        ) : currentStep === 'validate' && (
          <VoucherValidator onVoucherValidated={handleVoucherValidated} authToken={authToken} />
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
          />
        )}
      </div>
    </div>
  );
};

export default VoucherSplitApp;
