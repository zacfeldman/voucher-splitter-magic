import React from 'react';
import { useNavigate } from 'react-router-dom';
import VoucherBalanceChecker from '@/components/VoucherBalanceChecker';

const Check: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="py-8 px-4">
      <VoucherBalanceChecker onBack={() => navigate('/')} />
    </div>
  );
};

export default Check;
