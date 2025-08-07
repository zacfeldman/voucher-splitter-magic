import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { confirmElectricityMeter, vendElectricity } from '@/services/voucherApi';

interface VoucherElectricityRedeemProps {
  onBack: () => void;
  skipCheckStatus?: boolean;
  prefillPin?: string;
  prefillAmount?: number;
}

const VoucherElectricityRedeem: React.FC<VoucherElectricityRedeemProps> = ({ onBack, skipCheckStatus, prefillPin, prefillAmount }) => {
  const [pin, setPin] = useState(prefillPin || '');
  const [mobile, setMobile] = useState('');
  const [meter, setMeter] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'redeeming' | 'success' | 'error'>('form');
  const [confirmResult, setConfirmResult] = useState<any>(null);
  const [vendResult, setVendResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Confirm meter
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await confirmElectricityMeter({
        amount: prefillAmount || 0,
        meterNumber: meter,
        mobileNumber: mobile,
        voucherToken: pin,
      });
      setConfirmResult(result);
      setStep('confirm');
    } catch (err: any) {
      setError(err.message || 'Failed to confirm meter');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Vend
  const handleVend = async () => {
    if (!confirmResult) return;
    setLoading(true);
    setError(null);
    setStep('redeeming');
    try {
      const result = await vendElectricity({
        requestId: crypto.randomUUID(),
        conversationId: confirmResult.conversationId,
        reference: confirmResult.reference,
      });
      setVendResult(result);
      // Save to history
      const history = JSON.parse(localStorage.getItem('voucherHistory') || '[]');
      history.push({
        type: 'electricity-redemption',
        pin,
        mobile,
        meter,
        amount: prefillAmount || 0,
        redeemedAt: new Date().toISOString(),
        response: result,
      });
      localStorage.setItem('voucherHistory', JSON.stringify(history));
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to vend electricity');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset
  const handleReset = () => {
    setPin('');
    setMobile('');
    setMeter('');
    setConfirmResult(null);
    setVendResult(null);
    setError(null);
    setStep('form');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-pink-400">
      <Card className="w-full max-w-md mt-16">
        <CardContent className="p-8">
          {step === 'form' && (
            <form onSubmit={handleConfirm} className="space-y-6">
              <h2 className="text-2xl font-bold mb-2 text-center">Redeem Voucher for Electricity</h2>
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
              <Input
                placeholder="Meter Number (e.g. 12345678901)"
                value={meter}
                onChange={e => setMeter(e.target.value)}
                required
                className="mb-2"
              />
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={onBack} className="w-1/2">Back</Button>
                <Button type="submit" variant="default" className="w-1/2" disabled={loading}>{loading ? 'Checking...' : 'Confirm Meter'}</Button>
              </div>
            </form>
          )}
          {step === 'confirm' && confirmResult && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">Confirm Meter Details</h2>
              <div className="text-center">
                <div className="text-lg">Utility: <span className="font-bold">{confirmResult.utility}</span></div>
                {confirmResult.consumer && (
                  <div className="text-sm text-gray-500">Consumer: {confirmResult.consumer.name} ({confirmResult.consumer.address})</div>
                )}
                {confirmResult.consumerMessage && Array.isArray(confirmResult.consumerMessage) && confirmResult.consumerMessage.map((msg: string, i: number) => (
                  <div key={i} className="text-sm text-gray-500">{msg}</div>
                ))}
                <div className="text-sm text-gray-500">Meter: {meter}</div>
                <div className="text-sm text-gray-500">Mobile: {mobile}</div>
              </div>
              <div className="text-center text-sm text-gray-600">Proceed to vend electricity for this meter?</div>
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleReset} className="w-1/2">Cancel</Button>
                <Button variant="default" onClick={handleVend} className="w-1/2" disabled={loading}>{loading ? 'Vending...' : 'Vend Electricity'}</Button>
              </div>
            </div>
          )}
          {step === 'redeeming' && (
            <div className="text-center py-8">Vending electricity, please wait...</div>
          )}
          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div className="text-green-600 text-2xl font-bold">Success!</div>
              <div>Your electricity has been vended.</div>
              {vendResult && (
                <div className="mt-4 text-left text-xs bg-gray-100 rounded p-2 overflow-x-auto">
                  <div className="font-bold mb-1">Vend Details:</div>
                  {Object.entries(vendResult).map(([key, value]) => (
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

export default VoucherElectricityRedeem;