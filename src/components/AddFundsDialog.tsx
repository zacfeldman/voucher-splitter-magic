import React, { useState } from 'react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

export default function AddFundsDialog() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const { toast } = useToast();

  const handleAdd = () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter a valid amount greater than 0', variant: 'destructive' });
      return;
    }
    const cents = Math.round(parsed * 100);
    try {
      const current = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (!current || !current.phone) {
        toast({ title: 'Not logged in', description: 'Please log in to add funds to your wallet.', variant: 'destructive' });
        return;
      }
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const idx = users.findIndex((u: any) => u.phone === current.phone);
      if (idx === -1) {
        toast({ title: 'User not found', description: 'Could not find your account.', variant: 'destructive' });
        return;
      }
      users[idx].wallet = (Number(users[idx].wallet || 0) + cents);
      localStorage.setItem('users', JSON.stringify(users));
      const updatedCurrent = { ...(current || {}), wallet: users[idx].wallet };
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrent));
      window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedCurrent }));
      toast({ title: 'Wallet updated', description: `Added ${new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(cents/100)}` });
      setOpen(false);
      setAmount('');
    } catch (e) {
      console.warn('AddFunds error', e);
      toast({ title: 'Error', description: 'Failed to add funds', variant: 'destructive' });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(val) => setOpen(val)}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="w-full text-left">Add Funds</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add funds to your wallet</AlertDialogTitle>
          <AlertDialogDescription>Enter the amount in Rands to add to your wallet.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="pt-2">
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (e.g. 100.00)" />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAdd}>Add</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
