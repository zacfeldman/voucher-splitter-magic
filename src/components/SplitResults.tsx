import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { VariableVoucherVendJsonResponse } from '@/types/voucher';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Menu } from '@headlessui/react';

interface SplitResultsProps {
  splitVouchers: VariableVoucherVendJsonResponse[];
  onStartOver: () => void;
  onBack: () => void;
}

const SplitResults: React.FC<SplitResultsProps> = ({ splitVouchers, onStartOver, onBack }) => {
  const formatCurrency = (cents: number) => {
    return `R${(cents / 100).toFixed(2)}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: `${label} copied to clipboard`,
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    });
  };

  const downloadResults = () => {
    const data = safeSplitVouchers.map(voucher => ({
      'Token': voucher.token,
      'Amount': formatCurrency(voucher.amount),
      'Serial Number': voucher.serialNumber,
      'Reference': voucher.reference,
      'Expiry': voucher.expiryDateTime,
      'Instructions': voucher.productInstructions
    }));

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `split-vouchers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Voucher details saved to CSV file",
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    safeSplitVouchers.forEach((voucher, idx) => {
      let y = 20 + idx * 65;
      // Voucher number
      doc.setFontSize(16);
      doc.setTextColor(33, 102, 244); // blue
      doc.text(`Voucher ${idx + 1}`, 14, y);
      // Amount
      doc.setFontSize(20);
      doc.setTextColor(34, 197, 94); // green
      doc.text(`R${(voucher.amount / 100).toFixed(2)}`, 14, y + 12);
      // Token
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Token:', 14, y + 22);
      doc.setFont('courier', 'normal');
      doc.text(voucher.token, 32, y + 22);
      doc.setFont('helvetica', 'normal');
      // Serial
      doc.setFontSize(11);
      doc.text(`Serial:`, 14, y + 30);
      doc.setFont('courier', 'normal');
      doc.text(voucher.serialNumber, 32, y + 30);
      doc.setFont('helvetica', 'normal');
      // Expires
      doc.setFontSize(11);
      doc.text(`Expires:`, 14, y + 38);
      doc.text(voucher.expiryDateTime ? new Date(voucher.expiryDateTime).toLocaleDateString() : '-', 32, y + 38);
      // Instructions
      if (voucher.productInstructions) {
        doc.setFontSize(10);
        doc.setTextColor(33, 102, 244);
        doc.text('Instructions:', 14, y + 46);
        doc.setTextColor(0, 0, 0);
        doc.setFont('courier', 'normal');
        doc.text(voucher.productInstructions, 40, y + 46, { maxWidth: 150 });
        doc.setFont('helvetica', 'normal');
      }
      // Draw a rounded rectangle around the block
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(10, y - 10, 190, 55, 4, 4);
    });
    doc.save(`split-vouchers-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleShare = async () => {
    const shareText = safeSplitVouchers.map((voucher, idx) =>
      `Voucher ${idx + 1}\nToken: ${voucher.token}\nAmount: ${formatCurrency(voucher.amount)}\nSerial: ${voucher.serialNumber}\nExpires: ${voucher.expiryDateTime ? new Date(voucher.expiryDateTime).toLocaleDateString() : ''}\n---`
    ).join('\n\n');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Split Vouchers',
          text: shareText
        });
      } catch (err) {
        toast({ title: 'Share cancelled', description: '', variant: 'destructive' });
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({ title: 'Copied', description: 'Voucher details copied to clipboard' });
    }
  };

  const safeSplitVouchers = Array.isArray(splitVouchers) ? splitVouchers : [];
  const totalValue = safeSplitVouchers.reduce((sum, voucher) => sum + voucher.amount, 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="glass-effect shadow-xl text-center">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle className="text-2xl font-bold text-green-600">
              ✅ Voucher Split Successfully!
            </CardTitle>
            <div className="flex gap-2 justify-center md:justify-end">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button as={Button} variant="outline" className="flex items-center space-x-2">
                  <span role="img" aria-label="Download">⬇️</span>
                  <span>Download</span>
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-10">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-blue-100' : ''}`}
                        onClick={downloadPDF}
                      >
                        PDF
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-blue-100' : ''}`}
                        onClick={downloadResults}
                      >
                        CSV
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <span role="img" aria-label="Share">🔗</span>
                <span>Share</span>
              </Button>
              <Button
                onClick={onStartOver}
                className="blue-gradient hover:opacity-90 transition-opacity text-white"
              >
                Split Another Voucher
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mt-2">
            Your voucher has been split into {safeSplitVouchers.length} new vouchers totaling {formatCurrency(totalValue)}
          </p>
        </CardHeader>
        <CardContent>
          {/* ...existing code... */}
        </CardContent>
      </Card>

      {/* Split Vouchers */}
      {(() => {
        // Helper to chunk array into groups of 4
        const chunkArray = (arr, size) => arr.length === 0 ? [] : [arr.slice(0, size), ...chunkArray(arr.slice(size), size)];
        const voucherChunks = chunkArray(safeSplitVouchers, 4);
        return voucherChunks.map((chunk, groupIdx) => (
          <div key={groupIdx} className="flex flex-wrap justify-center gap-6 px-4 py-4 mb-16">
            {chunk.map((voucher, index) => {
              // Format dates as '18 Feb 2028'
              const formatDate = (dateStr: string | Date | undefined) => {
                if (!dateStr) return '-';
                const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
                return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              };
              const purchaseDate = formatDate(new Date());
              const expiryDate = formatDate(voucher.expiryDateTime);

              // PDF download for this voucher only
              const downloadVoucherPDF = () => {
                const doc = new jsPDF({ unit: 'pt', format: 'a4' });
                let y = 40;
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(40, y, 350, 420, 16, 16, 'F');
                doc.addImage('/blu-voucher-logo.png', 'PNG', 160, y + 16, 110, 30);
                y += 60;
                doc.setFontSize(12);
                doc.setTextColor(80, 80, 80);
                doc.text('Voucher Amount', 60, y);
                doc.text('Expiry Date', 260, y);
                doc.setFontSize(16);
                doc.setTextColor(30, 30, 30);
                doc.text(formatCurrency(voucher.amount), 60, y + 20);
                doc.text(expiryDate, 260, y + 20);
                y += 40;
                doc.setDrawColor(220, 220, 220);
                doc.line(60, y, 370, y);
                y += 30;
                doc.setFontSize(12);
                doc.setTextColor(120, 120, 120);
                doc.text('Voucher PIN', 60, y);
                doc.setFontSize(20);
                doc.setTextColor(30, 30, 30);
                doc.text(voucher.token, 60, y + 30);
                y += 60;
                doc.setFontSize(12);
                doc.setTextColor(80, 80, 80);
                doc.text('Purchase Date:', 60, y);
                doc.text(purchaseDate, 180, y);
                y += 20;
                doc.text('Voucher Serial Number:', 60, y);
                doc.text(voucher.serialNumber, 180, y);
                y += 20;
                doc.text('Transaction Reference Number:', 60, y);
                doc.text(voucher.reference, 240, y);
                y += 30;
                doc.setDrawColor(220, 220, 220);
                doc.line(60, y, 370, y);
                y += 20;
                doc.setFontSize(10);
                doc.setTextColor(80, 80, 80);
                doc.text('For redemption partners, please visit bluvoucher.co.za', 60, y);
                y += 16;
                doc.text('Customer Care: Please contact your service provider or WhatsApp us on 079 376 8590.', 60, y);
                doc.save(`voucher-${voucher.serialNumber}.pdf`);
              };

              // Format PIN with space every 4 digits
              const formatPin = (pin) => pin.replace(/(.{4})/g, '$1 ').trim();

              return (
                <div key={voucher.serialNumber} className="w-full max-w-xs md:max-w-sm mx-auto bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-10 flex flex-col items-center relative mb-8">
                  <img src="/blu-voucher-logo.png" alt="Blu Voucher Logo" className="h-8 mb-4 mt-2" />
                  <div className="w-full flex justify-between text-sm font-semibold text-gray-700 mb-4">
                    <div className="flex flex-col items-start">
                      <span>Voucher Amount</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(voucher.amount)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span>Expiry Date</span>
                      <span className="text-lg font-bold text-gray-900">{expiryDate}</span>
                    </div>
                  </div>
                  <hr className="w-full my-4 border-gray-200" />
                  <div className="w-full text-center text-xs font-semibold text-gray-600 mb-2">Voucher PIN</div>
                  <div className="w-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold tracking-widest text-gray-900 select-all text-center bg-gray-100 rounded px-3 py-2 whitespace-normal break-all" style={{letterSpacing: '0.08em'}}>{formatPin(voucher.token)}</span>
                    <button className="ml-2 p-1 rounded hover:bg-gray-100" onClick={() => copyToClipboard(voucher.token, 'Voucher PIN')} title="Copy PIN">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v9a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                  <div className="w-full flex flex-col gap-3 text-sm text-gray-700 mt-2 mb-2">
                    <div className="flex justify-between"><span>Purchase Date:</span><span className="font-bold">{purchaseDate}</span></div>
                    <div className="flex justify-between"><span>Voucher Serial Number:</span><span className="font-mono text-xs font-bold break-words max-w-[180px]">{voucher.serialNumber}</span></div>
                    <div className="flex justify-between"><span>Transaction Reference Number:</span><span className="font-mono text-xs font-bold break-words max-w-[180px]">{voucher.reference}</span></div>
                  </div>
                  <hr className="w-full my-4 border-gray-200" />
                  <div className="w-full text-xs text-center text-gray-700 mb-1">
                    For redemption partners, please visit <a href="https://bluvoucher.co.za" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">bluvoucher.co.za</a>
                  </div>
                  <div className="w-full text-xs text-center text-gray-700 mb-3">
                    Customer Care: Please contact your service provider or WhatsApp us on 079 376 8590.
                  </div>
                  <Button className="w-full mt-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full py-2 text-base shadow-md" onClick={downloadVoucherPDF}>
                    Download
                  </Button>
                </div>
              );
            })}
          </div>
        ));
      })()}
    </div>
  );
};

export default SplitResults;
