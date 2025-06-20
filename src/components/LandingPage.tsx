import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onSplitVoucher: () => void;
  onCheckBalance: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSplitVoucher, onCheckBalance }) => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden" style={{background: 'linear-gradient(120deg, #3B4CB8 0%, #A23BA3 60%, #E13CA0 100%)'}}>
      {/* SVG Wavy Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg" style={{zIndex: 1}}>
        <path d="M0,400 Q360,300 720,400 T1440,400 V600 H0 Z" fill="#fff" fillOpacity="0.04" />
        <path d="M0,350 Q360,250 720,350 T1440,350" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" fill="none" />
        <path d="M0,500 Q360,450 720,500 T1440,500" stroke="#fff" strokeOpacity="0.08" strokeWidth="2" fill="none" />
      </svg>
      {/* Hero Card with Logo */}
      <div className="relative z-10 flex flex-col items-center mt-24 mb-12">
        <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center" style={{minWidth: 320, maxWidth: 400}}>
          <img src="/blu-voucher-logo.png" alt="Blu Voucher Logo" className="h-16 w-auto mb-2" />
        </div>
        <h1 className="mt-10 text-3xl md:text-4xl lg:text-5xl font-extrabold text-white uppercase text-center tracking-wide drop-shadow-lg">Voucher Services</h1>
        <div className="w-32 h-1 bg-pink-500 rounded-full mt-4 mb-2" />
        <p className="text-white text-lg md:text-xl text-center opacity-90 font-sans">Manage your vouchers with ease</p>
      </div>
      {/* Main Actions */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-4 mb-24">
        <Card className="hover:shadow-2xl transition-shadow bg-white/90 backdrop-blur-md">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-primary">Split Voucher</h2>
            <p className="text-muted-foreground mb-4">
              Split your vouchers into smaller denominations
            </p>
            <Button onClick={onSplitVoucher} className="w-full">
              Split Voucher
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-shadow bg-white/90 backdrop-blur-md">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-primary">Check Balance</h2>
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