import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VoucherValidator from '@/components/VoucherValidator';
import VoucherSplitter from '@/components/VoucherSplitter';
import SplitResults from '@/components/SplitResults';
import { fetchAuthToken } from '@/services/voucherApi';
import { ValidateVoucherResponse, VariableVoucherVendJsonResponse } from '@/types/voucher';

const Split: React.FC = () => {
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [validatedVoucher, setValidatedVoucher] = useState<ValidateVoucherResponse | null>(null);
  const [voucherPin, setVoucherPin] = useState<string>('');
  const [splitVouchers, setSplitVouchers] = useState<VariableVoucherVendJsonResponse[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchAuthToken().then(t => { if (mounted) setAuthToken(t); }).catch(() => { if (mounted) setAuthToken(null); });
    return () => { mounted = false; };
  }, []);

  const handleVoucherValidated = (voucher: ValidateVoucherResponse, pin: string) => {
    setValidatedVoucher(voucher);
    setVoucherPin(pin);
  };

  const handleSplitComplete = (vouchers: VariableVoucherVendJsonResponse[]) => {
    setSplitVouchers(vouchers);
    // Save to history
    try {
      const history = JSON.parse(localStorage.getItem('voucherHistory') || '[]');
      history.push(...vouchers.map(v => ({ ...v, splitAt: new Date().toISOString(), type: 'split', status: 'Active' })));
      localStorage.setItem('voucherHistory', JSON.stringify(history));
    } catch {}
  };

  const handleBack = () => navigate('/');

  return (
    <div className="py-8 px-4">
      {!validatedVoucher ? (
        <VoucherValidator onVoucherValidated={handleVoucherValidated} authToken={authToken} onBack={handleBack} />
      ) : splitVouchers.length > 0 ? (
        <SplitResults splitVouchers={splitVouchers} onStartOver={() => { setValidatedVoucher(null); setSplitVouchers([]); }} onBack={handleBack} />
      ) : (
        <VoucherSplitter validatedVoucher={validatedVoucher} voucherPin={voucherPin} onSplitComplete={handleSplitComplete} onBack={() => setValidatedVoucher(null)} authToken={authToken} />
      )}
    </div>
  );
};

export default Split;
