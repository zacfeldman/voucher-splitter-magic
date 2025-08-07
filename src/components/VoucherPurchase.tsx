import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { purchaseVoucher } from '@/services/voucherApi';
import { toast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

const denominations = [10, 20, 50, 100, 200, 500, 1000, 2000];

function generateRequestId() {
  return ('10000000-1000-4000-8000-100000000000').replace(/[018]/g, c =>
    (parseInt(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> (parseInt(c) / 4)).toString(16)
  );
}

const VoucherPurchase: React.FC<{
  onBack: () => void;
  onRedeemAirtimeDirect?: (token: string, amount: number) => void;
  onRedeemElectricityDirect?: (token: string, amount: number) => void;
  onRedeemBetwayDirect?: (token: string, amount: number) => void;
}> = ({ onBack, onRedeemAirtimeDirect, onRedeemElectricityDirect, onRedeemBetwayDirect }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDenominationClick = (value: number) => {
    setAmount(value.toString());
  };

  const handlePurchase = async () => {
    setError(null);
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 2 || amt > 2000) {
      setError('Please enter an amount between R2 and R2000.');
      return;
    }
    setLoading(true);
    try {
      const now = new Date();
      const requestId = generateRequestId();
      const response = await purchaseVoucher({
        amount: Math.round(amt * 100),
        requestId,
      });
      setVoucher(response);
      toast({ title: 'Success', description: 'Voucher purchased successfully!' });
    } catch (e: any) {
      setError(e.message || 'Failed to purchase voucher.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16 flex flex-col items-center">
      <Card className="p-0 shadow-2xl rounded-2xl w-full">
        <CardHeader className="pt-10 pb-4 bg-gradient-to-r from-[#3B4CB8] to-[#E13CA0] rounded-t-2xl">
          <CardTitle className="text-3xl font-extrabold text-center text-white tracking-wide">Purchase Voucher</CardTitle>
        </CardHeader>
        <CardContent className="p-8 flex flex-col items-center">
          {voucher ? (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto text-green-500" size={48} />
              <div className="text-xl font-semibold text-green-700">Voucher purchased successfully!</div>
              <div className="bg-gray-50 rounded-lg p-4 text-left shadow-inner">
                <div><strong>Amount:</strong> R{(voucher.amount / 100).toFixed(2)}</div>
                <div><strong>Token:</strong> {voucher.token}</div>
                <div><strong>Serial Number:</strong> {voucher.serialNumber}</div>
                <div><strong>Expiry:</strong> {voucher.expiryDateTime ? new Date(voucher.expiryDateTime).toLocaleDateString() : '-'}</div>
                <div><strong>Reference:</strong> {voucher.reference}</div>
              </div>
              <Button onClick={() => { setVoucher(null); setAmount(''); }}>Purchase Another</Button>
              {onRedeemAirtimeDirect && voucher.token && (
                <Button variant="destructive" onClick={() => onRedeemAirtimeDirect(voucher.token, voucher.amount)}>
                  Redeem Now for Airtime
                </Button>
              )}
              {onRedeemElectricityDirect && voucher.token && (
                <Button variant="default" onClick={() => onRedeemElectricityDirect(voucher.token, voucher.amount)}>
                  Redeem Now for Electricity
                </Button>
              )}
              {onRedeemBetwayDirect && voucher.token && (
                <Button variant="secondary" onClick={() => onRedeemBetwayDirect(voucher.token, voucher.amount)}>
                  Top Up Betway Now
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 w-full">
                <div className="mb-3 text-center font-semibold text-lg">Select an amount</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 w-full">
                  {denominations.map(denom => (
                    <Button key={denom} variant="outline" className="text-xl font-bold py-6 rounded-xl w-full" onClick={() => handleDenominationClick(denom)}>
                      R{denom}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-col items-center w-full">
                  <label htmlFor="custom-amount" className="mb-2 font-medium text-gray-700">Or enter a custom amount</label>
                  <Input
                    id="custom-amount"
                    type="number"
                    min={2}
                    max={2000}
                    step={1}
                    placeholder="R2 - R2000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="text-center text-lg max-w-xs"
                    disabled={loading}
                  />
                </div>
              </div>
              {amount && !error && (
                <div className="mb-4 text-center text-lg font-semibold text-blue-700">Selected Amount: R{parseFloat(amount).toFixed(2)}</div>
              )}
              {error && <div className="text-red-600 text-center mb-4">{error}</div>}
              <div className="flex gap-4 mt-6 w-full">
                <Button variant="outline" onClick={onBack} className="flex-1">Back</Button>
                <Button onClick={handlePurchase} className="flex-1" disabled={loading}>
                  {loading ? 'Processing...' : 'Purchase'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherPurchase; 