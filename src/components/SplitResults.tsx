
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { VariableVoucherVendJsonResponse } from '@/types/voucher';
import { toast } from '@/hooks/use-toast';

interface SplitResultsProps {
  splitVouchers: VariableVoucherVendJsonResponse[];
  onStartOver: () => void;
}

const SplitResults: React.FC<SplitResultsProps> = ({ splitVouchers, onStartOver }) => {
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

  const totalValue = splitVouchers.reduce((sum, voucher) => sum + voucher.amount, 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="glass-effect shadow-xl text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-600">
            ✅ Voucher Split Successfully!
          </CardTitle>
          <p className="text-muted-foreground">
            Your voucher has been split into {splitVouchers.length} new vouchers totaling {formatCurrency(totalValue)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={downloadResults}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download CSV</span>
            </Button>
            <Button
              onClick={onStartOver}
              className="blue-gradient hover:opacity-90 transition-opacity text-white"
            >
              Split Another Voucher
            </Button>
          </div>
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
