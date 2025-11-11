import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { validateVoucher, fetchAuthToken } from '@/services/voucherApi';
import { RedeemSuccess } from './RedeemSuccess';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const formSchema = z.object({
  voucherNumber: z
    .string()
    .min(16, 'Voucher number must be 16 digits')
    .max(19, 'Voucher number must not exceed 19 characters'),
  cellphoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(10, 'Phone number must not exceed 10 digits')
    .regex(/^0[0-9]{9}$/, 'Must be a valid SA phone number starting with 0'),
  amount: z
    .number()
    .min(1, 'Amount must be greater than 0')
    .optional(),
});

interface VoucherRedeemProps {
  onBack: () => void;
}

export function VoucherRedeem({ onBack }: VoucherRedeemProps) {
  const { toast } = useToast();
  const [voucherBalance, setVoucherBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voucherNumber: '',
      cellphoneNumber: '',
      amount: 0,
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/api/redeem-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: values.voucherNumber.replace(/\s/g, ''),
          amount: values.amount || voucherBalance,
          cellphoneNumber: values.cellphoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to redeem voucher');
      }

        setRedemptionResult(data);

        // If a user is logged in (stored in localStorage), top up their wallet balance.
        try {
          const current = JSON.parse(localStorage.getItem('currentUser') || 'null');
          if (current && current.phone) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const idx = users.findIndex((u: any) => u.phone === current.phone);
            if (idx !== -1) {
              // data.amount is expected in cents from the API
              const added = Number(data.amount || 0);
              users[idx].wallet = (Number(users[idx].wallet || 0) + added);
              localStorage.setItem('users', JSON.stringify(users));
              // update currentUser snapshot too
              const updatedCurrent = { ...(current || {}), wallet: users[idx].wallet };
              localStorage.setItem('currentUser', JSON.stringify(updatedCurrent));
              // notify other parts of the app in this window to refresh user state
              window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedCurrent }));
            }
          }
        } catch (e) {
          // ignore storage errors
          console.warn('Failed to update user wallet after redeem', e);
        }

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to redeem voucher',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkVoucherBalance = async (voucherNumber: string) => {
    try {
      const authToken = await fetchAuthToken();
      const response = await validateVoucher({ pin: voucherNumber.replace(/\s/g, '') }, authToken);
      
      // Convert ValueCents to Rands
      const balanceInRands = response.ValueCents / 100;
      setVoucherBalance(balanceInRands);
      // Auto-fill the amount field with the full voucher value to make redemption easier
      try {
        form.setValue('amount', balanceInRands);
      } catch (e) {
        // ignore if form not ready
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to check voucher balance',
        variant: 'destructive',
      });
    }
  };

  // Prefill from navigation state when coming from purchase flow
  const location = useLocation();
  useEffect(() => {
    const state: any = (location && (location as any).state) || {};
    if (state?.token) {
      // token may be full token string
      try { form.setValue('voucherNumber', state.token); } catch {}
      // if amount provided, convert cents -> rands
      if (state.amount) {
        try { form.setValue('amount', state.amount / 100); } catch {}
      }
      // auto-check balance so the amount and details show
      try { checkVoucherBalance(state.token); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (redemptionResult) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-pink-400">
        <RedeemSuccess 
          amount={redemptionResult.amount / 100} 
          replacementVoucher={redemptionResult.replacementVoucher}
        />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Redeem Voucher</CardTitle>
        <CardDescription>Enter your voucher details below</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="mb-4"
              >
                ← Back
              </Button>
            </div>
            <FormField
              control={form.control}
              name="voucherNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voucher Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter voucher number"
                      onBlur={(e) => {
                        field.onBlur();
                        if (e.target.value) {
                          checkVoucherBalance(e.target.value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {voucherBalance !== null && (
              <div className="py-2">
                <p className="text-sm font-medium">Available Balance: R{voucherBalance.toFixed(2)}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to Redeem (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cellphoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cell Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter cell phone number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Redeeming...' : 'Redeem Voucher'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}