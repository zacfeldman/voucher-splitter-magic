import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LandingPageProps {
  onSplitVoucher?: () => void;
  onCheckBalance?: () => void;
  onRedeemAirtime?: () => void;
  onRedeemElectricity?: () => void;
  onRedeemBetway?: () => void;
  onRedeemVoucher?: () => void;
  onPurchaseVoucher?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSplitVoucher, onCheckBalance, onRedeemAirtime, onRedeemElectricity, onRedeemBetway, onRedeemVoucher }) => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex flex-col justify-center items-center relative overflow-hidden">
      {/* Hero Card with Logo */}
      <div className="relative z-10 flex flex-col items-center mt-16 mb-10">
        <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center" style={{minWidth: 320, maxWidth: 400}}>
          <img src="/blu-voucher-logo.png" alt="Blu Voucher Logo" className="h-16 w-auto mb-2" />
        </div>
        <h1 className="mt-12 text-3xl md:text-4xl lg:text-5xl font-extrabold text-white uppercase text-center tracking-wide drop-shadow-lg">Blu Voucher Management</h1>
        <div className="w-32 h-1 bg-pink-500 rounded-full mt-6 mb-4" />
        <p className="text-white text-lg md:text-xl text-center opacity-90 font-sans mb-2">Your voucher, your way!</p>
      </div>
      {/* Main Actions */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full px-4 mb-32">
        {/* Row 1 */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Redeem Voucher Card */}
        <Card className="hover:shadow-2xl transition-shadow bg-white/90 backdrop-blur-md">
          <CardContent className="p-10 text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-primary">Redeem Voucher</h2>
            <p className="text-muted-foreground mb-4">Redeem your voucher in full or get a replacement voucher</p>
            <Button onClick={() => { if (onRedeemVoucher) onRedeemVoucher(); navigate('/redeem'); }} variant="default" className="w-full">Redeem Voucher</Button>
          </CardContent>
        </Card>
        {/* Split Voucher Card */}
        <Card className="hover:shadow-2xl transition-shadow bg-white/90 backdrop-blur-md">
          <CardContent className="p-10 text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-primary">Split Voucher</h2>
            <p className="text-muted-foreground mb-4">Split your voucher into smaller denominations</p>
            <Button onClick={() => { if (onSplitVoucher) onSplitVoucher(); navigate('/split'); }} variant="default" className="w-full">Split Voucher</Button>
          </CardContent>
        </Card>
        {/* Check Voucher Card */}
        <Card className="hover:shadow-2xl transition-shadow bg-white/90 backdrop-blur-md">
          <CardContent className="p-10 text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-primary">Check Voucher</h2>
            <p className="text-muted-foreground mb-4">View your voucher status and details</p>
            <Button onClick={() => { if (onCheckBalance) onCheckBalance(); navigate('/check'); }} variant="secondary" className="w-full">Check Voucher</Button>
          </CardContent>
        </Card>
        {/* Redeem for Airtime Card */}
        <Card className="hover:shadow-2xl transition-shadow bg-white/90 backdrop-blur-md">
          <CardContent className="p-10 text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-4.41 0-8-1.79-8-4V6c0-2.21 3.59-4 8-4s8 1.79 8 4v8c0 2.21-3.59 4-8 4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-primary">Redeem for Airtime</h2>
            <p className="text-muted-foreground mb-4">Redeem your voucher directly for airtime top-up</p>
            <Button onClick={() => { if (onRedeemAirtime) onRedeemAirtime(); navigate('/airtime'); }} variant="outline" className="w-full">Redeem Airtime</Button>
          </CardContent>
        </Card>
        {/* Redeem for Electricity Card */}
        <Card className="hover:shadow-2xl transition-shadow bg-white/90 backdrop-blur-md">
          <CardContent className="p-10 text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-primary">Redeem for Electricity</h2>
            <p className="text-muted-foreground mb-4">Redeem your voucher for prepaid electricity</p>
            <Button onClick={() => { if (onRedeemElectricity) onRedeemElectricity(); navigate('/electricity'); }} variant="outline" className="w-full">Redeem Electricity</Button>
          </CardContent>
        </Card>
        {/* Redeem for Betway Card */}
        <Card className="hover:shadow-2xl transition-shadow bg-white/90 backdrop-blur-md">
          <CardContent className="p-10 text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C9.79 2 8 3.79 8 6s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 18c-4.41 0-8-1.79-8-4v-2c0-2.21 3.59-4 8-4s8 1.79 8 4v2c0 2.21-3.59 4-8 4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-primary">Top Up Betway</h2>
            <p className="text-muted-foreground mb-4">Redeem your voucher directly to your Betway account</p>
            <Button onClick={() => { if (onRedeemBetway) onRedeemBetway(); navigate('/betway'); }} variant="outline" className="w-full">Top Up Betway</Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default LandingPage;