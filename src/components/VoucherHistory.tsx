import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';

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
    <div className="relative">
      <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center w-full max-w-sm border border-gray-200 relative mx-auto">
        <h2 className="text-xl font-bold mb-2 text-center text-blue-700">Voucher Details</h2>
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
  const [checkingIdx, setCheckingIdx] = useState<number | null>(null);
  const [historyState, setHistoryState] = useState(history);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Filter and search logic
  const filteredHistory = historyState.filter((v: any) => {
    const status = v.status ? v.status.toLowerCase() : '';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesSearch =
      v.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
      (v.amount && (v.amount / 100).toFixed(2).includes(search));
    return matchesStatus && (search === '' || matchesSearch);
  });

  const handleCheckStatus = async (v: any, idx: number) => {
    setCheckingIdx(idx);
    try {
      const res = await import('@/services/voucherApi');
      const response = await res.checkVoucherBalance(v.token || v.pin || v.serialNumber);
      // Update status in localStorage and state
      const updatedHistory = [...historyState];
      updatedHistory[idx] = { ...updatedHistory[idx], status: response.status || 'Unknown' };
      setHistoryState(updatedHistory);
      localStorage.setItem('voucherHistory', JSON.stringify(updatedHistory));
      toast({ title: 'Status Updated', description: `Voucher status: ${response.status || 'Unknown'}` });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to check status', variant: 'destructive' });
    } finally {
      setCheckingIdx(null);
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    let updatedHistory = [...historyState];
    let updated = false;
    for (let i = 0; i < updatedHistory.length; i++) {
      const v = updatedHistory[i];
      const status = v.status ? v.status.toLowerCase() : '';
      if (status !== 'redeemed') {
        try {
          const res = await import('@/services/voucherApi');
          const response = await res.checkVoucherBalance(v.token || v.pin || v.serialNumber);
          updatedHistory[i] = { ...updatedHistory[i], status: response.status || 'Unknown' };
          updated = true;
        } catch {}
      }
    }
    if (updated) {
      setHistoryState(updatedHistory);
      localStorage.setItem('voucherHistory', JSON.stringify(updatedHistory));
      toast({ title: 'Statuses Refreshed', description: 'All non-redeemed vouchers have been updated.' });
    } else {
      toast({ title: 'No Updates', description: 'No non-redeemed vouchers to refresh.' });
    }
    setRefreshing(false);
  };

  if (!historyState.length) {
    return <div className="text-center text-white mt-10">No voucher history found.</div>;
  }

  return (
    <div className="flex justify-center items-start min-h-[70vh] w-full">
      <div className="w-full max-w-5xl bg-white/95 rounded-3xl shadow-2xl p-12 mt-16 mb-16 border border-blue-100">
        <h2 className="text-3xl font-extrabold mb-10 text-center text-pink-600 tracking-wide drop-shadow">Voucher History</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex gap-2 items-center">
            <label className="font-semibold text-base">Status:</label>
            <select className="border rounded px-3 py-2 text-base" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="redeemed">Redeemed</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <input
            className="border rounded px-3 py-2 text-base w-full md:w-80"
            type="text"
            placeholder="Search by serial or amount..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded px-6 py-2 text-base disabled:opacity-60 shadow" onClick={handleRefreshAll} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh All'}
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-blue-100 shadow-sm">
          <table className="min-w-full text-base bg-white rounded-xl">
            <thead className="bg-blue-50">
              <tr className="text-left border-b border-blue-100">
                <th className="py-5 px-7 font-bold">Date</th>
                <th className="py-5 px-7 font-bold">Serial Number</th>
                <th className="py-5 px-7 font-bold">Amount</th>
                <th className="py-5 px-7 font-bold">PIN</th>
                <th className="py-5 px-7 font-bold">Status</th>
                <th className="py-5 px-7 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((v: any, i: number) => (
                <tr key={v.serialNumber + (v.splitAt || v.checkedAt) + i} className="border-b border-blue-100 hover:bg-pink-50 transition-all">
                  <td className="py-5 px-7 whitespace-nowrap">{v.splitAt || v.checkedAt ? new Date(v.splitAt || v.checkedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  <td className="py-5 px-7 font-mono break-all">{v.serialNumber}</td>
                  <td className="py-5 px-7 font-bold">R{(v.amount / 100).toFixed(2)}</td>
                  <td className="py-5 px-7 font-mono break-all">{v.token || v.pin || '-'}</td>
                  <td className="py-5 px-7">{
                    v.status
                      ? v.status.toLowerCase() === 'active'
                        ? 'Active'
                        : v.status.toLowerCase() === 'redeemed'
                          ? 'Split (Redeemed)'
                          : v.status.charAt(0).toUpperCase() + v.status.slice(1).toLowerCase()
                      : '-'
                  }</td>
                  <td className="py-5 px-7">
                    <button className="bg-pink-500 hover:bg-pink-600 text-white font-bold rounded px-4 py-2 text-sm shadow" onClick={() => setSelected(v)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-full max-w-xl mx-auto flex flex-col items-center">
              <div className="bg-white rounded-2xl shadow-xl p-8 pt-10 relative w-full flex flex-col items-center">
                <img src="/blu-voucher-logo.png" alt="Blu Voucher Logo" className="h-12 w-auto mb-4 mt-2" />
                <button className="absolute top-4 right-4 text-gray-500 hover:text-pink-500 text-xl font-bold" onClick={() => setSelected(null)}>&times;</button>
                <VoucherCard voucher={selected} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherHistory; 