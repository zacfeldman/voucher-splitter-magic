import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<'date' | 'serialNumber' | 'amount' | 'pin' | 'type' | 'status'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [visibleCols, setVisibleCols] = useState({
    date: true,
    serialNumber: true,
    amount: true,
    pin: true,
    type: true,
    status: true,
    action: true,
  });
  const [showFilters, setShowFilters] = useState(false);

  const normalizeType = (t?: string) => {
    if (!t) return 'unknown';
    const n = t.toLowerCase();
    if (n === 'split-original') return 'split';
    if (n.includes('airtime')) return 'redeem airtime';
    if (n.includes('electricity')) return 'redeem electricity';
    if (n.includes('betway')) return 'topup betway';
    return n;
  };

  // Filter and search logic
  const filteredSortedHistory = React.useMemo(() => {
    const s = search.trim().toLowerCase();
    const base = historyState.filter((v: any) => {
      const status = (v.status ? String(v.status) : '').toLowerCase();
      const type = normalizeType(v.type);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesType = typeFilter === 'all' || type === typeFilter;
      if (!s) return matchesStatus && matchesType;
      const fields: string[] = [
        v.serialNumber,
        v.token || v.pin,
        v.reference,
        v.meter,
        v.mobile,
        v.utility,
        v.amount != null ? String((v.amount / 100).toFixed(2)) : undefined,
        status,
        type,
      ]
        .filter(Boolean)
        .map((x: any) => String(x).toLowerCase());
      const matchesSearch = fields.some(str => str.includes(s));
      return matchesStatus && matchesType && matchesSearch;
    });
    const getDate = (v: any) => new Date(v.splitAt || v.checkedAt || v.redeemedAt || v.createdAt || 0).getTime();
    const getType = (v: any) => normalizeType(v.type);
    const getStatus = (v: any) => (v.status ? String(v.status) : '').toLowerCase();
    const comparator = (a: any, b: any) => {
      let cmp = 0;
      if (sortKey === 'date') {
        cmp = getDate(a) - getDate(b);
      } else if (sortKey === 'serialNumber') {
        cmp = String(a.serialNumber || '').localeCompare(String(b.serialNumber || ''));
      } else if (sortKey === 'amount') {
        cmp = (a.amount || 0) - (b.amount || 0);
      } else if (sortKey === 'pin') {
        cmp = String(a.token || a.pin || '').localeCompare(String(b.token || b.pin || ''));
      } else if (sortKey === 'type') {
        cmp = getType(a).localeCompare(getType(b));
      } else if (sortKey === 'status') {
        cmp = getStatus(a).localeCompare(getStatus(b));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    };
    return base.sort(comparator);
  }, [historyState, search, statusFilter, typeFilter, sortKey, sortDir]);

  // Pagination
  const totalItems = filteredSortedHistory.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const pagedHistory = filteredSortedHistory.slice(pageStart, pageEnd);

  // Reset to page 1 on filter/search/pageSize change
  React.useEffect(() => { setPage(1); }, [search, statusFilter, typeFilter, pageSize]);

  const toggleSort = (key: 'date' | 'serialNumber' | 'amount' | 'pin' | 'type' | 'status') => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'date' ? 'desc' : 'asc');
    }
  };

  const handleDownloadCsv = () => {
    const rows = filteredSortedHistory.map((v: any) => ({
      Date: v.splitAt || v.checkedAt || v.redeemedAt || v.createdAt || '',
      SerialNumber: v.serialNumber || '',
      Amount: v.amount != null ? (v.amount / 100).toFixed(2) : '',
      PIN: v.token || v.pin || '',
      Type: normalizeType(v.type),
      Status: v.status || '',
      Mobile: v.mobile || '',
      Meter: v.meter || '',
      Reference: v.reference || '',
    }));
    const headers = Object.keys(rows[0] || {});
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${String((r as any)[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voucher_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <input
            className="border rounded px-3 py-2 text-base w-full md:w-80"
            type="text"
            placeholder="Search all columns..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded px-4 py-2 text-base shadow" onClick={() => setShowFilters(s => !s)}>{showFilters ? 'Hide Filters' : 'Show Filters'}</button>
          <div className="flex gap-2 items-center">
            <label className="font-semibold text-base">Rows:</label>
            <select className="border rounded px-3 py-2 text-base" value={pageSize} onChange={e => setPageSize(parseInt(e.target.value))}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded px-4 py-2 text-base shadow" onClick={handleDownloadCsv}>Download CSV</button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded px-6 py-2 text-base disabled:opacity-60 shadow" onClick={handleRefreshAll} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh All'}
          </button>
        </div>
        {showFilters && (
          <div className="rounded-xl border border-blue-100 bg-white/70 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2 items-center">
                <label className="font-semibold text-base">Status:</label>
                <select className="border rounded px-3 py-2 text-base" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="redeemed">Redeemed</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <label className="font-semibold text-base">Type:</label>
                <select className="border rounded px-3 py-2 text-base" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="purchase">Purchase</option>
                  <option value="split">Split</option>
                  <option value="redeem electricity">Redeem Electricity</option>
                  <option value="redeem airtime">Redeem Airtime</option>
                  <option value="topup betway">Topup Betway</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <button className="ml-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded px-4 py-2 text-base shadow" onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }}>Clear Filters</button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto rounded-xl border border-blue-100 shadow-sm bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleCols.date && (
                  <TableHead className="py-5 px-7 cursor-pointer select-none" onClick={() => toggleSort('date')}>
                    <div className="flex items-center gap-2">
                      <span>Date {sortKey === 'date' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                      <button className="text-xs text-gray-400 hover:text-gray-700" onClick={(e) => { e.stopPropagation(); setVisibleCols(v => ({ ...v, date: false })); }}>Hide</button>
                    </div>
                  </TableHead>
                )}
                {visibleCols.serialNumber && (
                  <TableHead className="py-5 px-7 cursor-pointer select-none" onClick={() => toggleSort('serialNumber')}>
                    <div className="flex items-center gap-2">
                      <span>Serial Number {sortKey === 'serialNumber' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                      <button className="text-xs text-gray-400 hover:text-gray-700" onClick={(e) => { e.stopPropagation(); setVisibleCols(v => ({ ...v, serialNumber: false })); }}>Hide</button>
                    </div>
                  </TableHead>
                )}
                {visibleCols.amount && (
                  <TableHead className="py-5 px-7 cursor-pointer select-none" onClick={() => toggleSort('amount')}>
                    <div className="flex items-center gap-2">
                      <span>Amount {sortKey === 'amount' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                      <button className="text-xs text-gray-400 hover:text-gray-700" onClick={(e) => { e.stopPropagation(); setVisibleCols(v => ({ ...v, amount: false })); }}>Hide</button>
                    </div>
                  </TableHead>
                )}
                {visibleCols.pin && (
                  <TableHead className="py-5 px-7 cursor-pointer select-none" onClick={() => toggleSort('pin')}>
                    <div className="flex items-center gap-2">
                      <span>PIN {sortKey === 'pin' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                      <button className="text-xs text-gray-400 hover:text-gray-700" onClick={(e) => { e.stopPropagation(); setVisibleCols(v => ({ ...v, pin: false })); }}>Hide</button>
                    </div>
                  </TableHead>
                )}
                {visibleCols.type && (
                  <TableHead className="py-5 px-7 cursor-pointer select-none" onClick={() => toggleSort('type')}>
                    <div className="flex items-center gap-2">
                      <span>Type {sortKey === 'type' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                      <button className="text-xs text-gray-400 hover:text-gray-700" onClick={(e) => { e.stopPropagation(); setVisibleCols(v => ({ ...v, type: false })); }}>Hide</button>
                    </div>
                  </TableHead>
                )}
                {visibleCols.status && (
                  <TableHead className="py-5 px-7 cursor-pointer select-none" onClick={() => toggleSort('status')}>
                    <div className="flex items-center gap-2">
                      <span>Status {sortKey === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                      <button className="text-xs text-gray-400 hover:text-gray-700" onClick={(e) => { e.stopPropagation(); setVisibleCols(v => ({ ...v, status: false })); }}>Hide</button>
                    </div>
                  </TableHead>
                )}
                {visibleCols.action && (
                  <TableHead className="py-5 px-7">Action</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedHistory.map((v: any, i: number) => (
                <TableRow key={v.serialNumber + (v.splitAt || v.checkedAt || v.redeemedAt || v.createdAt) + i}>
                  {visibleCols.date && (
                    <TableCell className="py-5 px-7 whitespace-nowrap">{v.splitAt || v.checkedAt || v.redeemedAt || v.createdAt ? new Date(v.splitAt || v.checkedAt || v.redeemedAt || v.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                  )}
                  {visibleCols.serialNumber && (
                    <TableCell className="py-5 px-7 font-mono break-all">{v.serialNumber}</TableCell>
                  )}
                  {visibleCols.amount && (
                    <TableCell className="py-5 px-7 font-bold">R{(v.amount / 100).toFixed(2)}</TableCell>
                  )}
                  {visibleCols.pin && (
                    <TableCell className="py-5 px-7 font-mono break-all">{v.token || v.pin || '-'}</TableCell>
                  )}
                  {visibleCols.type && (
                    <TableCell className="py-5 px-7">{
                      (() => {
                        const t = normalizeType(v.type);
                        return t.split(' ').map((w: string, idx: number) => idx === 0 ? (w.charAt(0).toUpperCase() + w.slice(1)) : w).join(' ');
                      })()
                    }</TableCell>
                  )}
                  {visibleCols.status && (
                    <TableCell className="py-5 px-7">{
                      v.status
                        ? v.status.toLowerCase() === 'active'
                          ? 'Active'
                          : v.status.toLowerCase() === 'redeemed'
                            ? 'Split (Redeemed)'
                            : v.status.charAt(0).toUpperCase() + v.status.slice(1).toLowerCase()
                        : '-'
                    }</TableCell>
                  )}
                  {visibleCols.action && (
                    <TableCell className="py-5 px-7">
                      <button className="bg-pink-500 hover:bg-pink-600 text-white font-bold rounded px-4 py-2 text-sm shadow" onClick={() => setSelected(v)}>View</button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-3">
          <button className="text-sm text-gray-600 hover:underline" onClick={() => setVisibleCols({ date: true, serialNumber: true, amount: true, pin: true, type: true, status: true, action: true })}>Reset Columns</button>
        </div>
        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
          <div className="text-sm text-gray-600">Showing {Math.min(totalItems, pageEnd)} of {totalItems} items</div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded border disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >Prev</button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <button
              className="px-3 py-2 rounded border disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >Next</button>
          </div>
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