import React from 'react';
import { useNavigate } from 'react-router-dom';
import VoucherHistory from '@/components/VoucherHistory';

const History: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="py-8 px-4">
      <VoucherHistory />
    </div>
  );
};

export default History;
