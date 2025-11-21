"use client";

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { AppContext } from '@/context/AppContext';
import { hashPin } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { suggestPin } from '@/ai/flows/suggest-pin';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function PinModal({ isOpen, setIsOpen }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [isLocking, setIsLocking] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { shuffledPlayers } = useContext(AppContext);
  const router = useRouter();
  const { toast } = useToast();

  const handleSuggestPin = async () => {
    setIsSuggesting(true);
    try {
      const result = await suggestPin();
      setPin(result.pin);
    } catch (error) {
      console.error('Error suggesting PIN:', error);
      toast({
        title: 'Error',
        description: 'Could not suggest a PIN. Please enter one manually.',
        variant: 'destructive',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleLockOrder = async () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({
        title: 'Invalid PIN',
        description: 'Please enter a 4-digit PIN.',
        variant: 'destructive',
      });
      return;
    }

    setIsLocking(true);
    try {
      const pinHash = await hashPin(pin);
      const batch = writeBatch(db);

      const auctionRef = doc(db, 'auctions', 'default');
      batch.set(auctionRef, {
        locked: true,
        generatedAt: serverTimestamp(),
        pinHash,
      });

      shuffledPlayers.forEach((playerName, index) => {
        const playerDocRef = doc(db, 'auctions', 'default', 'order', String(index));
        batch.set(playerDocRef, {
          playerName,
          orderNumber: index + 1,
        });
      });

      await batch.commit();

      toast({
        title: 'Order Locked!',
        description: 'The auction order has been saved successfully.',
      });

      router.push('/final');
    } catch (error) {
      console.error('Error locking order:', error);
      toast({
        title: 'Locking Failed',
        description: 'There was an error saving the order. Please try again.',
        variant: 'destructive',
      });
      setIsLocking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Freeze Final Order</DialogTitle>
          <DialogDescription>
            Set a 4-digit PIN to lock this order. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pin" className="text-right">
              PIN
            </Label>
            <Input
              id="pin"
              type="text"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="col-span-3 font-code tracking-widest"
              placeholder="1234"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSuggestPin}
            disabled={isSuggesting}
            className="w-full"
          >
            {isSuggesting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Suggest a PIN with AI
          </Button>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleLockOrder} disabled={isLocking || pin.length !== 4}>
            {isLocking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm & Lock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
