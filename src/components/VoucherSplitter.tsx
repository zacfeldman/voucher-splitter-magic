import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { ValidateVoucherResponse } from '@/types/voucher';
import { toast } from '@/hooks/use-toast';
import { splitVoucher } from '@/services/voucherApi';

interface VoucherSplitterProps {
  validatedVoucher: ValidateVoucherResponse;
  voucherPin: string;
  onSplitComplete: (splitVouchers: any[]) => void;
  onBack: () => void;
  authToken: string | null;
}

const VoucherSplitter: React.FC<VoucherSplitterProps> = ({
  validatedVoucher,
  voucherPin,
  onSplitComplete,
  onBack,
  authToken
}) => {
  // Store splits as strings for raw user input
  const [splits, setSplits] = useState<string[]>(['']);
  const [isSplitting, setIsSplitting] = useState(false);

  const formatCurrency = (cents: number) => {
    return `R${(cents / 100).toFixed(2)}`;
  };

  const addSplit = () => {
    // Smart default: if all splits are empty or zero, auto-fill all with even split
    const allEmpty = splits.every(s => !s || parseFloat(s) === 0);
    const newSplitsCount = splits.length + 1;
    if (allEmpty && newSplitsCount > 1) {
      const evenValue = (validatedVoucher.ValueCents / 100 / newSplitsCount).toFixed(2);
      setSplits(Array(newSplitsCount).fill(evenValue));
    } else {
      setSplits([...splits, '']);
    }
  };

  const removeSplit = (index: number) => {
    setSplits(splits.filter((_, i) => i !== index));
  };

  const updateSplit = (index: number, value: string) => {
    const newSplits = splits.map((v, i) => (i === index ? value : v));
    // Smart default: if editing any split except the last, auto-fill the last with the remaining value
    if (index !== splits.length - 1) {
      // Calculate total of all except last
      const totalExceptLast = newSplits.slice(0, -1).reduce((sum, s) => sum + (parseFloat(s.replace(',', '.')) || 0), 0);
      const remaining = (validatedVoucher.ValueCents / 100) - totalExceptLast;
      if (remaining >= 0) {
        newSplits[newSplits.length - 1] = remaining.toFixed(2);
      }
    }
    setSplits(newSplits);
  };

  // Add this helper to format a string as a decimal with two places
  const formatSplitValue = (value: string) => {
    const num = parseFloat(value.replace(',', '.'));
    if (isNaN(num)) return '';
    return num.toFixed(2);
  };

  // Convert all splits to cents for calculations
  const splitsInCents = splits.map((value) => {
    const normalized = value.replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : Math.round(num * 100);
  });

  const totalSplitValue = splitsInCents.reduce((sum, split) => sum + split, 0);
  const remainingValue = validatedVoucher.ValueCents - totalSplitValue;
  // Allow split if at least one split is > 0
  const isValidSplit = splitsInCents.some(split => split > 0);

  // Validation feedback
  const showWarning = totalSplitValue !== validatedVoucher.ValueCents && splitsInCents.length > 0;

  const handleSplit = async () => {
    // Remove empty or zero splits before submitting
    const filteredSplits = splitsInCents.filter(amount => amount > 0);
    if (filteredSplits.length === 0 || filteredSplits.reduce((a, b) => a + b, 0) !== validatedVoucher.ValueCents) {
      toast({
        title: "Invalid Split",
        description: "Split amounts must sum to the original voucher value",
        variant: "destructive",
      });
      return;
    }

    if (authToken === null) {
      toast({
        title: "Authentication Error",
        description: "API access token is not available.",
        variant: "destructive",
      });
      return;
    }

    setIsSplitting(true);
    try {
      const desiredVouchers = filteredSplits.map(amount => ({ ValueCents: amount }));
      const response = await splitVoucher({
        pin: voucherPin,
        splitVouchers: desiredVouchers,
      }, authToken);

      onSplitComplete(response.splitVouchers);
      toast({
        title: "Success",
        description: response.message || "Voucher split successfully",
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
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Total Split:</span>
            <span className={totalSplitValue === validatedVoucher.ValueCents ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
              {formatCurrency(totalSplitValue)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Remaining:</span>
            <span className={remainingValue === 0 ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>
              {formatCurrency(remainingValue)}
            </span>
          </div>
          {showWarning && (
            <div className="text-sm text-red-600 font-semibold mb-2">Total split must match the original voucher value.</div>
          )}
          <div className="flex gap-2 mb-4">
            {[2, 3, 4].map(n => (
              <Button
                key={n}
                variant="outline"
                size="sm"
                onClick={() => {
                  const evenValue = (validatedVoucher.ValueCents / 100 / n).toFixed(2);
                  setSplits(Array(n).fill(evenValue));
                }}
                className="flex-1"
              >
                Split in {n}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                const input = prompt('How many splits? (2-100)');
                const n = Number(input);
                if (n && n >= 2 && n <= 100) {
                  const evenValue = (validatedVoucher.ValueCents / 100 / n).toFixed(2);
                  setSplits(Array(n).fill(evenValue));
                } else if (input !== null) {
                  alert('Please enter a number between 2 and 100.');
                }
              }}
            >
              Custom
            </Button>
          </div>
          {splits.map((split, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Label className="w-20 text-sm">Voucher {index + 1}:</Label>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="^\\d*[.,]?\\d*$"
                  placeholder="0.00"
                  value={split}
                  onChange={(e) => updateSplit(index, e.target.value)}
                  onBlur={(e) => updateSplit(index, formatSplitValue(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSplit();
                      // Focus the new input after adding
                      setTimeout(() => {
                        const nextInput = document.querySelectorAll('input[type="text"][inputmode="decimal"]')[index + 1];
                        if (nextInput) (nextInput as HTMLInputElement).focus();
                      }, 0);
                    }
                  }}
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

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={addSplit}
              className="flex-1 border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Split Amount
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const emptyIndex = splits.findIndex(s => !s || s.trim() === '');
                const remainingRand = (remainingValue / 100).toFixed(2);
                if (emptyIndex !== -1) {
                  updateSplit(emptyIndex, remainingRand);
                } else {
                  setSplits([...splits, remainingRand]);
                }
              }}
              disabled={remainingValue <= 0}
              className="flex-1 border-dashed border-2 border-green-300 text-green-700 hover:bg-green-50"
            >
              Add Remaining Amount
            </Button>
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
