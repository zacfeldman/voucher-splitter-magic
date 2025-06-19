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
    const data = splitVouchers.map(voucher => ({
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
    splitVouchers.forEach((voucher, idx) => {
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
    const shareText = splitVouchers.map((voucher, idx) =>
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

  const totalValue = splitVouchers.reduce((sum, voucher) => sum + voucher.amount, 0);

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
            Your voucher has been split into {splitVouchers.length} new vouchers totaling {formatCurrency(totalValue)}
          </p>
        </CardHeader>
        <CardContent>
          {/* ...existing code... */}
        </CardContent>
      </Card>

      {/* Split Vouchers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {splitVouchers.map((voucher, index) => (
          <Card key={voucher.serialNumber} className="glass-effect shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-center text-blue-600">
                Voucher {index + 1}
              </CardTitle>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(voucher.amount)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Token:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(voucher.token, 'Token')}
                    className="h-6 p-1 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="text-center bg-gray-100 p-2 rounded font-mono text-sm break-all">
                  {voucher.token}
                </div>
              </div>

              <div className="text-xs space-y-1">
                <div><strong>Serial:</strong> {voucher.serialNumber}</div>
                <div><strong>Reference:</strong> {voucher.reference}</div>
                <div><strong>Expires:</strong> {new Date(voucher.expiryDateTime).toLocaleDateString()}</div>
              </div>

              <div className="text-xs p-2 bg-blue-50 rounded">
                <strong>Instructions:</strong> {voucher.productInstructions}
              </div>

              {voucher.customerMessage && (
                <div className="text-xs p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                  <strong>Note:</strong> {voucher.customerMessage}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SplitResults;
