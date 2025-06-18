import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { validateVoucher } from '@/services/voucherApi';
import { ValidateVoucherResponse } from '@/types/voucher';
import { toast } from '@/hooks/use-toast';

interface VoucherValidatorProps {
  onVoucherValidated: (voucher: ValidateVoucherResponse, pin: string) => void;
  authToken: string | null;
}

const VoucherValidator: React.FC<VoucherValidatorProps> = ({ onVoucherValidated, authToken }) => {
  const [pin, setPin] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    if (!pin.trim()) {
      toast({
        title: "Error",
        description: "Please enter a voucher PIN",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      if (authToken === null) {
        throw new Error("Authentication token not available.");
      }
      const response = await validateVoucher({ pin: pin.trim() }, authToken);
      
      if (!response.VoucherCanBeSplit) {
        toast({
          title: "Cannot Split",
          description: "This voucher cannot be split",
          variant: "destructive",
        });
        return;
      }

      onVoucherValidated(response, pin.trim());
      toast({
        title: "Success",
        description: "Voucher validated successfully",
      });
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "Failed to validate voucher",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `R${(cents / 100).toFixed(2)}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-effect shadow-xl">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Validate Voucher
        </CardTitle>
        <p className="text-muted-foreground">Enter your voucher PIN to get started</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="pin" className="text-sm font-medium">
            Voucher PIN
          </Label>
          <Input
            id="pin"
            type="text"
            placeholder="Enter voucher PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.trim())}
            onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
            disabled={isValidating}
            className="text-center text-lg tracking-wider"
          />
        </div>
        
        <Button
          onClick={handleValidate}
          disabled={isValidating}
          className="w-full blue-gradient hover:opacity-90 transition-opacity text-white font-semibold py-3"
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            'Validate Voucher'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VoucherValidator;
