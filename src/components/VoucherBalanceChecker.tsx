import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { checkVoucherBalance } from '@/services/voucherApi';
import { toast } from '@/hooks/use-toast';

interface VoucherBalanceCheckerProps {
  onBack: () => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatCurrency = (cents: number) => `R${(cents / 100).toFixed(2)}`;

const VoucherBalanceChecker: React.FC<VoucherBalanceCheckerProps> = ({ onBack }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [voucherInfo, setVoucherInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [lastCheckedPin, setLastCheckedPin] = useState<string>("");

  const handleCheckBalance = async () => {
    if (!pin) {
      toast({
        title: "Error",
        description: "Please enter a voucher PIN",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await checkVoucherBalance(pin);
      setVoucherInfo(response);
      setLastCheckedPin(pin);
      toast({
        title: "Success",
        description: "Voucher balance retrieved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check balance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Check Voucher Balance</CardTitle>
        <p className="text-muted-foreground">Enter your voucher PIN to check its balance</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">Voucher PIN</Label>
            <Input
              id="pin"
              type="text"
              placeholder="Enter voucher PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>

          {voucherInfo && (
            <Card className="glass-effect shadow-lg hover:shadow-xl transition-shadow border-blue-100 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-center text-blue-600">
                  Voucher Balance
                </CardTitle>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(voucherInfo.amount)}
                  </div>
                </div>
              </CardHeader>
              <div className="flex flex-col items-center mb-2">
                <span className="text-sm font-medium">Voucher PIN:</span>
                <div className="flex items-center justify-center">
                  <div className="text-center bg-gray-100 p-2 rounded font-mono text-lg break-all mt-1 mb-2">
                    {lastCheckedPin}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(lastCheckedPin)}
                    className="h-6 p-1 text-xs ml-2"
                    title="Copy PIN"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
              <div className="text-xs space-y-1 px-4 pb-4 pt-2">
                <div><strong>Status:</strong> {voucherInfo.status}</div>
                <div><strong>Serial:</strong> {voucherInfo.serialNumber}</div>
                <div><strong>Expires:</strong> {formatDate(voucherInfo.expiryDateTime)}</div>
                <div><strong>Voucher Type:</strong> {voucherInfo.voucherType}</div>
                <div><strong>Sale Date:</strong> {formatDate(voucherInfo.saleDateTime)}</div>
                <div><strong>Entity Name:</strong> {voucherInfo.entityName}</div>
              </div>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={handleCheckBalance} disabled={loading}>
              {loading ? "Checking..." : "Check Balance"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoucherBalanceChecker; 