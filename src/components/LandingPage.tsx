import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onSplitVoucher: () => void;
  onCheckBalance: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSplitVoucher, onCheckBalance }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
          Blue Label Voucher Services
        </h1>
        <p className="text-xl text-muted-foreground">
          Manage your vouchers with ease
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Split Voucher</h2>
            <p className="text-muted-foreground mb-4">
              Split your vouchers into smaller denominations
            </p>
            <Button onClick={onSplitVoucher} className="w-full">
              Split Voucher
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Check Balance</h2>
            <p className="text-muted-foreground mb-4">
              View your voucher balance and details
            </p>
            <Button onClick={onCheckBalance} className="w-full">
              Check Balance
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandingPage; 