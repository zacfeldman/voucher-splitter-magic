import React, { useState } from 'react';

const VoucherCard = ({ voucher }: { voucher: any }) => {
  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return '-';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const purchaseDate = voucher.splitAt ? formatDate(voucher.splitAt) : '-';
  const expiryDate = formatDate(voucher.expiryDateTime);
  const formatPin = (pin: string) => pin.replace(/(.{4})/g, '$1 ').trim();
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center w-full max-w-sm border border-gray-200 relative mx-auto">
      <img src="/blu-voucher-logo.png" alt="Blu Voucher Logo" className="h-8 mb-4 mt-2" />
      <div className="w-full flex justify-between text-sm font-semibold text-gray-700 mb-2">
        <div className="flex flex-col items-start">
          <span>Voucher Amount</span>
          <span className="text-lg font-bold text-gray-900">R{(voucher.amount / 100).toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-end">
          <span>Expiry Date</span>
          <span className="text-lg font-bold text-gray-900">{expiryDate}</span>
        </div>
      </div>
      <hr className="w-full my-2 border-gray-200" />
      <div className="w-full text-center text-xs font-semibold text-gray-600 mb-1">Voucher PIN</div>
      <div className="w-full flex items-center justify-center mb-2">
        <span className="text-2xl font-bold tracking-widest text-gray-900 select-all" style={{letterSpacing: '0.08em'}}>{formatPin(voucher.token)}</span>
      </div>
      <div className="w-full flex flex-col gap-1 text-sm text-gray-700 mt-2 mb-2">
        <div className="flex justify-between"><span>Purchase Date:</span><span className="font-bold">{purchaseDate}</span></div>
        <div className="flex justify-between"><span>Voucher Serial Number:</span><span className="font-bold">{voucher.serialNumber}</span></div>
        <div className="flex justify-between"><span>Transaction Reference Number:</span><span className="font-bold">{voucher.reference}</span></div>
      </div>
      <hr className="w-full my-2 border-gray-200" />
      <div className="w-full text-xs text-center text-gray-700 mb-1">
        For redemption partners, please visit <a href="https://bluvoucher.co.za" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">bluvoucher.co.za</a>
      </div>
      <div className="w-full text-xs text-center text-gray-700 mb-2">
        Customer Care: Please contact your service provider or WhatsApp us on 079 376 8590.
      </div>
    </div>
  );
};

const VoucherHistory: React.FC = () => {
  const history = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('voucherHistory') || '[]');
    } catch {
      return [];
    }
  }, []);
  const [selected, setSelected] = useState<any | null>(null);

  if (!history.length) {
    return <div className="text-center text-white mt-10">No voucher history found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white/90 rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-pink-600">Voucher Split History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Serial Number</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((v: any, i: number) => (
              <tr key={v.serialNumber + v.splitAt + i} className="border-b hover:bg-pink-50">
                <td className="py-2 px-4">{v.splitAt ? new Date(v.splitAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                <td className="py-2 px-4 font-mono">{v.serialNumber}</td>
                <td className="py-2 px-4 font-bold">R{(v.amount / 100).toFixed(2)}</td>
                <td className="py-2 px-4">
                  <button className="bg-pink-500 hover:bg-pink-600 text-white font-bold rounded px-3 py-1 text-xs" onClick={() => setSelected(v)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 relative w-full max-w-md mx-auto">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-pink-500 text-xl font-bold" onClick={() => setSelected(null)}>&times;</button>
            <VoucherCard voucher={selected} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherHistory; 