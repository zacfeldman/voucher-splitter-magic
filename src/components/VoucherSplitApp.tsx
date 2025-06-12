
import React, { useState } from 'react';
import VoucherValidator from './VoucherValidator';
import VoucherSplitter from './VoucherSplitter';
import SplitResults from './SplitResults';
import { ValidateVoucherResponse, VariableVoucherVendJsonResponse } from '@/types/voucher';

type AppStep = 'validate' | 'split' | 'results';

const VoucherSplitApp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('validate');
  const [validatedVoucher, setValidatedVoucher] = useState<ValidateVoucherResponse | null>(null);
  const [voucherPin, setVoucherPin] = useState<string>('');
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
    setCurrentStep('validate');
    setValidatedVoucher(null);
    setVoucherPin('');
    setSplitVouchers([]);
  };

  const handleBack = () => {
    setCurrentStep('validate');
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
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep === 'validate' ? 'bg-blue-600 text-white' : 
              currentStep === 'split' || currentStep === 'results' ? 'bg-green-600 text-white' : 'bg-gray-300'
            }`}>
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
        {currentStep === 'validate' && (
          <VoucherValidator onVoucherValidated={handleVoucherValidated} />
        )}

        {currentStep === 'split' && validatedVoucher && (
          <VoucherSplitter
            validatedVoucher={validatedVoucher}
            voucherPin={voucherPin}
            onSplitComplete={handleSplitComplete}
            onBack={handleBack}
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
