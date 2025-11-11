import { useNavigate } from 'react-router-dom';
import { VoucherRedeem } from '@/components/VoucherRedeem';

const Redeem = () => {
  const navigate = useNavigate();
  return (
    <div className="py-8 px-4">
      <VoucherRedeem onBack={() => navigate('/')} />
    </div>
  );
};

export default Redeem;
