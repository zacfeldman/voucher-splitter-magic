import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface ReplacementVoucher {
  token: string;
  serialNumber: string;
  expiryDateTime: string;
  barcode: string;
  productName: string;
  productInstructions: string;
  productHelp: string;
  customerMessage: string;
  reference: string;
}

interface RedeemSuccessProps {
  amount: number;
  replacementVoucher?: ReplacementVoucher;
  onDone?: () => void;
}

export function RedeemSuccess({ amount, replacementVoucher, onDone }: RedeemSuccessProps) {
  const navigate = useNavigate();
  const formattedAmount = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
  const [copied, setCopied] = useState(false);

  const formatToken = (token: string) => {
    return token.match(/.{1,4}/g)?.join(' ') || token;
  };

  const formatDate = (dateString: string) => {
    // Short date like 6/17/2028
    try {
      const d = new Date(dateString);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  const copyToken = async (token?: string) => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
            <CardTitle>Redemption Successful!</CardTitle>
            <CardDescription>{replacementVoucher ? 'A replacement voucher has been generated' : 'Thank you — your voucher has been redeemed'}</CardDescription>
          </CardHeader>

        <CardContent>
          <div className="rounded-md bg-white shadow p-6">
            <div className="text-center">
              <div className="text-3xl text-green-600 font-bold">{formattedAmount}</div>
              {replacementVoucher ? (
                <>
                  <div className="mt-3 text-sm text-gray-600">Voucher PIN:</div>
                  <div className="mt-2 flex items-center justify-center">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono">{formatToken(replacementVoucher.token)}</div>
                    <Button variant="outline" className="ml-2" onClick={() => copyToken(replacementVoucher?.token)}>
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-3 text-sm text-gray-700">Thank you for redeeming your voucher. Your payment was successful.</div>
              )}
            </div>

            <div className="mt-6 text-sm text-gray-700">
              <div className="mb-2"><span className="font-semibold">Status:</span> REDEEMED</div>

              {!replacementVoucher && (
                <div className="mt-4 text-sm text-gray-600">Your wallet or payment was successful for this value.</div>
              )}
            </div>

            {replacementVoucher && (
              <div className="mt-4 border-t pt-4">
                <div className="font-semibold mb-2">Replacement Voucher</div>
                {replacementVoucher.serialNumber && (
                  <div className="mb-2"><span className="font-semibold">Serial:</span> {replacementVoucher.serialNumber}</div>
                )}
                {replacementVoucher.expiryDateTime && (
                  <div className="mb-2"><span className="font-semibold">Expires:</span> {formatDate(replacementVoucher.expiryDateTime)}</div>
                )}
                {replacementVoucher.productName && (
                  <div className="mb-2"><span className="font-semibold">Voucher Type:</span> {replacementVoucher.productName}</div>
                )}
                {replacementVoucher.reference && (
                  <div className="mb-2"><span className="font-semibold">Reference:</span> {replacementVoucher.reference}</div>
                )}
              </div>
            )}

            {replacementVoucher?.productInstructions && (
              <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">{replacementVoucher.productInstructions}</div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/history')}>History</Button>
            <Button onClick={() => {
              if (onDone) return onDone();
              return navigate('/');
            }}>Done</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}