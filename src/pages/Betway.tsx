import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import VoucherBetwayRedeem from '@/components/VoucherBetwayRedeem';

const Betway: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state: any = (location && (location as any).state) || {};

  return (
    <div className="py-8 px-4">
      <VoucherBetwayRedeem onBack={() => navigate('/')} skipCheckStatus prefillPin={state.token} prefillAmount={state.amount} />
    </div>
  );
};

export default Betway;
