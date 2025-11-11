import React from 'react';
import { useNavigate } from 'react-router-dom';
import VoucherPurchase from '@/components/VoucherPurchase';

const Purchase: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="py-8 px-4">
      <VoucherPurchase
        onBack={() => navigate('/')}
        onRedeemAirtimeDirect={(token, amount) => navigate('/airtime', { state: { token, amount } })}
        onRedeemElectricityDirect={(token, amount) => navigate('/electricity', { state: { token, amount } })}
        onRedeemBetwayDirect={(token, amount) => navigate('/betway', { state: { token, amount } })}
      />
    </div>
  );
};

export default Purchase;
