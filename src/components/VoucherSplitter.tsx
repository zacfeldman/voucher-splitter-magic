
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { ValidateVoucherResponse, DesiredVoucher } from '@/types/voucher';
import { splitVoucher } from '@/services/voucherApi';
import { toast } from '@/hooks/use-toast';

interface VoucherSplitterProps {
  validatedVoucher: ValidateVoucherResponse;
  voucherPin: string;
  onSplitComplete: (splitVouchers: any[]) => void;
  onBack: () => void;
}

const VoucherSplitter: React.FC<VoucherSplitterProps> = ({
  validatedVoucher,
  voucherPin,
  onSplitComplete,
  onBack
}) => {
  const [splits, setSplits] = useState<number[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);

  const formatCurrency = (cents: number) => {
    return `R${(cents / 100).toFixed(2)}`;
  };

  const addSplit = () => {
    setSplits([...splits, 0]);
  };

  const removeSplit = (index: number) => {
    setSplits(splits.filter((_, i) => i !== index));
  };

  const updateSplit = (index: number, value: string) => {
    const cents = Math.round(parseFloat(value || '0') * 100);
    const newSplits = [...splits];
    newSplits[index] = cents;
    setSplits(newSplits);
  };

  const totalSplitValue = splits.reduce((sum, split) => sum + split, 0);
  const remainingValue = validatedVoucher.ValueCents - totalSplitValue;
  const isValidSplit = totalSplitValue === validatedVoucher.ValueCents && splits.every(split => split > 0);

  const handleSplit = async () => {
    if (!isValidSplit) {
      toast({
        title: "Invalid Split",
        description: "Split amounts must sum to the original voucher value",
        variant: "destructive",
      });
      return;
    }

    setIsSplitting(true);
    try {
      const splitVouchers: DesiredVoucher[] = splits.map(valueCents => ({ ValueCents: valueCents }));
      const response = await splitVoucher({
        pin: voucherPin,
        splitVouchers
      });

      onSplitComplete(response.SplitVouchers);
      toast({
        title: "Success",
        description: "Voucher split successfully",
      });
    } catch (error) {
      console.error('Split error:', error);
      toast({
        title: "Split Failed",
        description: error instanceof Error ? error.message : "Failed to split voucher",
        variant: "destructive",
      });
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Original Voucher Info */}
      <Card className="glass-effect shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">Original Voucher</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(validatedVoucher.ValueCents)}
          </div>
          <div className="text-sm text-muted-foreground">
            Serial: {validatedVoucher.SerialNumber}
          </div>
          <div className="text-sm text-muted-foreground">
            Status: {validatedVoucher.VoucherStatus}
          </div>
        </CardContent>
      </Card>

      {/* Split Configuration */}
      <Card className="glass-effect shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">Configure Split</CardTitle>
          <p className="text-center text-muted-foreground">
            Add the amounts you want to split into
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {splits.map((split, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Label className="w-16 text-sm">Amount {index + 1}:</Label>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={split > 0 ? (split / 100).toFixed(2) : ''}
                  onChange={(e) => updateSplit(index, e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeSplit(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addSplit}
            className="w-full border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Split Amount
          </Button>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Total Split:</span>
              <span className="font-semibold">{formatCurrency(totalSplitValue)}</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining:</span>
              <span className={`font-semibold ${remainingValue === 0 ? 'text-green-600' : remainingValue < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                {formatCurrency(Math.abs(remainingValue))}
                {remainingValue < 0 && ' (Over)'}
              </span>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
              disabled={isSplitting}
            >
              Back
            </Button>
            <Button
              onClick={handleSplit}
              disabled={!isValidSplit || isSplitting}
              className="flex-1 blue-gradient hover:opacity-90 transition-opacity text-white font-semibold"
            >
              {isSplitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Splitting...
                </>
              ) : (
                'Split Voucher'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherSplitter;
