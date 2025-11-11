import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { purchaseVoucher } from '@/services/voucherApi';
import { RedeemSuccess } from './RedeemSuccess';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Copy, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [redemptionResult, setRedemptionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDenominationClick = (value: number) => {
    setAmount(value.toString());
  };

  // Format token into groups of 4 and force two groups per line for a neat 2-line display
  const formatToken = (token: string) => {
    if (!token) return '';
    return token.replace(/(.{4})/g, '$1 ').trim();
  };

  const copyToken = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copied', description: 'Token copied to clipboard' });
    }).catch(() => {
      toast({ title: 'Error', description: 'Failed to copy to clipboard', variant: 'destructive' });
    });
  };

  const handleShare = async (voucher: any) => {
    const shareText = `Voucher\nToken: ${voucher.token}\nAmount: R${(voucher.amount/100).toFixed(2)}\nSerial: ${voucher.serialNumber}\nReference: ${voucher.reference}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Voucher', text: shareText });
      } catch (err) {
        toast({ title: 'Share cancelled', description: '', variant: 'destructive' });
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({ title: 'Copied', description: 'Voucher details copied to clipboard' });
    }
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
      // If user is logged in, ensure they have enough wallet balance
      const current = JSON.parse(localStorage.getItem('currentUser') || 'null');
      const costCents = Math.round(amt * 100);
      if (current && current.phone) {
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const idx = users.findIndex((u: any) => u.phone === current.phone);
          const userWallet = idx !== -1 ? (users[idx].wallet || 0) : (current.wallet || 0);
          if (userWallet < costCents) {
            setError('Insufficient funds in wallet. Please add funds or choose a smaller amount.');
            setLoading(false);
            return;
          }
        } catch (e) {
          // ignore and proceed as guest
        }
      }
      const now = new Date();
      const requestId = generateRequestId();
      const response = await purchaseVoucher({
        amount: Math.round(amt * 100),
        requestId,
      });
      setVoucher(response);
      // Deduct wallet funds for logged-in user (only after successful purchase)
      try {
        const currentAfter = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const cost = Math.round(amt * 100);
        if (currentAfter && currentAfter.phone) {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const idx = users.findIndex((u: any) => u.phone === currentAfter.phone);
          if (idx !== -1) {
            users[idx].wallet = (users[idx].wallet || 0) - cost;
            localStorage.setItem('users', JSON.stringify(users));
            const updatedCurrent = { ...currentAfter, wallet: users[idx].wallet };
            localStorage.setItem('currentUser', JSON.stringify(updatedCurrent));
            window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedCurrent }));
            toast({ title: 'Wallet Charged', description: `R${(cost/100).toFixed(2)} deducted from wallet` });
          } else {
            // user not found in users array; update currentUser only
            const updatedCurrent = { ...currentAfter, wallet: (currentAfter.wallet || 0) - cost };
            localStorage.setItem('currentUser', JSON.stringify(updatedCurrent));
            window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedCurrent }));
            toast({ title: 'Wallet Charged', description: `R${(cost/100).toFixed(2)} deducted from wallet` });
          }
        }
      } catch (e) {
        // ignore wallet update errors
      }
      // Save purchase to history
      try {
        const history = JSON.parse(localStorage.getItem('voucherHistory') || '[]');
        history.push({
          type: 'purchase',
          serialNumber: response.serialNumber,
          amount: response.amount,
          token: response.token,
          reference: response.reference,
          expiryDateTime: response.expiryDateTime,
          status: 'Active',
          checkedAt: new Date().toISOString(),
        });
        localStorage.setItem('voucherHistory', JSON.stringify(history));
      } catch {}
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
          {redemptionResult ? (
            <div className="w-full">
              <RedeemSuccess
                amount={redemptionResult.amount / 100}
                replacementVoucher={redemptionResult.replacementVoucher}
                onDone={() => { setRedemptionResult(null); setVoucher(null); setAmount(''); }}
              />
            </div>
          ) : voucher ? (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto text-green-500" size={48} />
              <div className="text-xl font-semibold text-green-700">Voucher purchased successfully!</div>
              <div className="bg-gray-50 rounded-lg p-4 text-left shadow-inner">
                <div><strong>Amount:</strong> R{(voucher.amount / 100).toFixed(2)}</div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <strong>Token:</strong>
                    <span className="font-mono font-bold text-base text-gray-900 select-all bg-gray-100 rounded px-2 py-1 whitespace-nowrap">{formatToken(voucher.token)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => copyToken(voucher.token)} className="h-6 px-2 text-xs" title="Copy Token">
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare(voucher)} className="h-6 px-2 text-xs">
                      <span role="img" aria-label="Share" className="text-sm">🔗</span> Share
                    </Button>
                  </div>
                </div>
                <div><strong>Serial Number:</strong> {voucher.serialNumber}</div>
                <div><strong>Expiry:</strong> {voucher.expiryDateTime ? new Date(voucher.expiryDateTime).toLocaleDateString() : '-'}</div>
                <div><strong>Reference:</strong> {voucher.reference}</div>
              </div>
              <div className="flex justify-center gap-3">
                <Button onClick={() => { setVoucher(null); setAmount(''); }}>Purchase Another</Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" className="inline-flex items-center">
                      Redeem Voucher
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => {
                      navigate('/redeem', { state: { token: voucher.token, amount: voucher.amount } });
                    }}>
                      Redeem Voucher
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      onRedeemAirtimeDirect?.(voucher.token, voucher.amount);
                    }}>
                      Redeem for Airtime
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      onRedeemElectricityDirect?.(voucher.token, voucher.amount);
                    }}>
                      Redeem for Electricity
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      onRedeemBetwayDirect?.(voucher.token, voucher.amount);
                    }}>
                      Top Up Betway
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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