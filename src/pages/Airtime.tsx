import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import VoucherAirtimeRedeem from '@/components/VoucherAirtimeRedeem';

const Airtime: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state: any = (location && (location as any).state) || {};

  return (
    <div className="py-8 px-4">
      <VoucherAirtimeRedeem onBack={() => navigate('/')} skipCheckStatus prefillPin={state.token} prefillAmount={state.amount} />
    </div>
  );
};

export default Airtime;
