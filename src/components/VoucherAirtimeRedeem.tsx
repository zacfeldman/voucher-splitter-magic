import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { checkVoucherBalance, redeemAirtime } from '@/services/voucherApi';

interface VoucherAirtimeRedeemProps {
  onBack: () => void;
  skipCheckStatus?: boolean;
  prefillPin?: string;
  prefillAmount?: number;
}

const VoucherAirtimeRedeem: React.FC<VoucherAirtimeRedeemProps> = ({ onBack, skipCheckStatus, prefillPin, prefillAmount }) => {
  const [pin, setPin] = useState(prefillPin || '');
  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState<'form' | 'quote' | 'redeeming' | 'success' | 'error'>('form');
  const [voucherInfo, setVoucherInfo] = useState<any>(null);
  const [redemptionResult, setRedemptionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [voucherStatus, setVoucherStatus] = useState<string | null>(null);

  // Step 1: Check voucher or redeem immediately if skipCheckStatus
  const handleCheckVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (skipCheckStatus) {
      setVoucherInfo({ valueCents: prefillAmount || 0 });
      setStep('quote');
      setLoading(false);
      return;
    }
    try {
      const info = await checkVoucherBalance(pin);
      setVoucherInfo(info);
      setVoucherStatus(info?.VoucherStatus || info?.status || null);
      if ((info?.VoucherStatus || info?.status) !== 'Active') {
        setError('This voucher is not active and cannot be redeemed.');
        setStep('form');
        return;
      }
      setStep('quote');
    } catch (err: any) {
      setError(err.message || 'Failed to check voucher');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Redeem
  const handleRedeem = async () => {
    setLoading(true);
    setError(null);
    setStep('redeeming');
    try {
      const result = await redeemAirtime({
        requestId: crypto.randomUUID(),
        mobileNumber: mobile,
        tokenNumber: pin,
        amount: voucherInfo?.valueCents || voucherInfo?.amount || 0,
      });
      setRedemptionResult(result);
      // Save to history
      const history = JSON.parse(localStorage.getItem('voucherHistory') || '[]');
      history.push({
        type: 'airtime-redemption',
        pin,
        mobile,
        amount: voucherInfo?.valueCents || voucherInfo?.amount || 0,
        redeemedAt: new Date().toISOString(),
        response: result,
      });
      localStorage.setItem('voucherHistory', JSON.stringify(history));
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to redeem airtime');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset
  const handleReset = () => {
    setPin('');
    setMobile('');
    setVoucherInfo(null);
    setRedemptionResult(null);
    setError(null);
    setStep('form');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-pink-400">
      <Card className="w-full max-w-md mt-16">
        <CardContent className="p-8">
          {step === 'form' && (
            <form onSubmit={handleCheckVoucher} className="space-y-6">
              <h2 className="text-2xl font-bold mb-2 text-center">Redeem Voucher for Airtime</h2>
              <Input
                placeholder="Voucher PIN (e.g. 1234 5678 9012 3456)"
                value={pin}
                onChange={e => setPin(e.target.value)}
                required
                className="mb-2"
              />
              <Input
                placeholder="Mobile Number (e.g. 0830000000)"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                required
                className="mb-2"
              />
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={onBack} className="w-1/2">Back</Button>
                <Button type="submit" variant="default" className="w-1/2" disabled={loading}>{loading ? 'Checking...' : 'Check Voucher'}</Button>
              </div>
            </form>
          )}
          {step === 'quote' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">Voucher Details</h2>
              <div className="text-center">
                {voucherInfo && (
                  <div className="text-lg">Voucher Value: <span className="font-bold">R{((voucherInfo.valueCents || voucherInfo.amount || 0) / 100).toFixed(2)}</span></div>
                )}
                <div className="text-sm text-gray-500">Mobile: {mobile}</div>
                {!skipCheckStatus && <div className="text-sm text-gray-500">Status: {voucherStatus}</div>}
              </div>
              <div className="text-center text-sm text-gray-600">Proceed to redeem this voucher for airtime?</div>
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleReset} className="w-1/2">Cancel</Button>
                <Button variant="default" onClick={handleRedeem} className="w-1/2" disabled={loading || (!skipCheckStatus && voucherStatus !== 'Active')}>{loading ? 'Redeeming...' : 'Redeem Airtime'}</Button>
              </div>
            </div>
          )}
          {step === 'redeeming' && (
            <div className="text-center py-8">Redeeming airtime, please wait...</div>
          )}
          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div className="text-green-600 text-2xl font-bold">Success!</div>
              <div>Your airtime has been redeemed.</div>
              {redemptionResult && (
                <div className="mt-4 text-left text-xs bg-gray-100 rounded p-2 overflow-x-auto">
                  <div className="font-bold mb-1">Redemption Details:</div>
                  {Object.entries(redemptionResult).map(([key, value]) => (
                    <div key={key}><span className="font-semibold">{key}:</span> {JSON.stringify(value)}</div>
                  ))}
                </div>
              )}
              <Button variant="default" onClick={onBack}>Back to Home</Button>
            </div>
          )}
          {step === 'error' && (
            <div className="space-y-6 text-center">
              <div className="text-red-600 text-2xl font-bold">Error</div>
              <div>{error}</div>
              <Button variant="default" onClick={handleReset}>Try Again</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherAirtimeRedeem; 