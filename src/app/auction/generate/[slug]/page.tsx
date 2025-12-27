
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Player, PlayerSet } from '@/lib/player-data';
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { shuffleArray, hashPin } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Lock, Unlock, Users, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';

export default function GenerateOrderPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const setRef = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    return doc(firestore, 'sets', slug) as DocumentReference<PlayerSet>;
  }, [firestore, slug]);

  const { data: set, isLoading: isLoadingSet } = useDoc<PlayerSet>(setRef);

  const [order, setOrder] = useState<Player[]>([]);
  const [pin, setPin] = useState('');
  const [verifyPin, setVerifyPin] = useState('');

  useEffect(() => {
    if (set) {
      if (set.lockedOrder) {
        setOrder(set.lockedOrder);
      } else {
        setOrder(shuffleArray(set.players));
      }
    }
  }, [set]);
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    } else if (set && user && set.userId !== user.uid) {
        router.push('/'); // Not the owner
    }
  }, [user, isUserLoading, set, router]);

  const handleRegenerate = () => {
    if (set) {
      setOrder(shuffleArray(set.players));
      toast({title: "Order Regenerated", description: "The player auction order has been shuffled."})
    }
  };

  const handleLockOrder = async () => {
     if (pin.length !== 4) {
      toast({ title: 'Invalid PIN', description: 'PIN must be 4 digits.', variant: 'destructive' });
      return;
    }
    if (!setRef || !set) return;

    const hashedPin = await hashPin(pin);
    
    updateDocumentNonBlocking(setRef, {
        lockedOrder: order,
        hashedPin: hashedPin,
        lockedAt: new Date().toISOString()
    });

    toast({
      title: 'Order Locked!',
      description: `The auction order for "${set.name}" is now locked and cannot be changed.`,
    });
    setPin('');
  };
  
  const handleUnlockOrder = async () => {
     if (verifyPin.length !== 4 || !set?.hashedPin) {
      toast({ title: 'Invalid PIN', description: 'PIN must be 4 digits.', variant: 'destructive' });
      return;
    }
    if (!setRef) return;
    
    const hashedVerifyPin = await hashPin(verifyPin);

    if(hashedVerifyPin === set.hashedPin) {
        updateDocumentNonBlocking(setRef, {
            lockedOrder: null,
            hashedPin: null,
            lockedAt: null
        });
        toast({
          title: 'Order Unlocked!',
          description: `The auction order has been unlocked.`,
        });
        setVerifyPin('');

    } else {
        toast({
          title: 'Incorrect PIN',
          description: `The PIN you entered is incorrect.`,
          variant: 'destructive'
        });
    }
  }


  const isLoading = isLoadingSet || isUserLoading;

  if (isLoading || !set) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Button variant="outline" asChild>
        <Link href="/"><ArrowLeft className="mr-2" /> Back to Sets</Link>
      </Button>

      <Card className="glow-border">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Auction Order for "{set.name}"</CardTitle>
          <CardDescription>
            {set.lockedOrder ? 'This order is locked. You must unlock it to make changes.' : 'Review the randomly generated auction order. You can regenerate it or lock it in.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
            {set.lockedOrder && set.lockedAt && (
                <div className="mb-4 p-3 rounded-md bg-green-900/50 border border-green-500/50 text-green-300 flex items-center gap-3">
                    <ShieldCheck />
                    <div>
                        <p className="font-bold">Order Locked</p>
                        <p className="text-xs">This order was locked on {new Date(set.lockedAt).toLocaleString()}.</p>
                    </div>
                </div>
            )}

          <div className="max-h-[500px] overflow-y-auto pr-4 border rounded-lg p-2 bg-background/50">
            <ol className="space-y-2">
              {order.map((player, index) => (
                <li key={player.id} className="flex items-center gap-4 p-3 bg-secondary rounded-md">
                  <span className="font-bold text-primary text-xl w-8 text-center">{index + 1}.</span>
                  <div className="flex-1">
                    <p className="font-medium text-lg">{player.playerName}</p>
                    <p className="text-xs text-muted-foreground">#{player.playerNumber}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {!set.lockedOrder ? (
            <>
              <Button variant="outline" onClick={handleRegenerate}>
                <RefreshCw className="mr-2" /> Regenerate
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="btn-glow">
                    <Lock className="mr-2" /> Lock Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Set a PIN to Lock This Order</AlertDialogTitle>
                    <AlertDialogDescription>
                      Once locked, this order cannot be changed. The 4-digit PIN will be required to unlock it. Do not forget this PIN.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                     <InputOTP maxLength={4} value={pin} onChange={(value) => setPin(value)}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                        </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLockOrder} disabled={pin.length !== 4}>Lock It</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Unlock className="mr-2" /> Unlock Order
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Enter PIN to Unlock</AlertDialogTitle>
                    <AlertDialogDescription>
                      To unlock and allow regeneration of this auction order, please enter the 4-digit PIN you set.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                     <InputOTP maxLength={4} value={verifyPin} onChange={(value) => setVerifyPin(value)}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                        </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUnlockOrder} disabled={verifyPin.length !== 4}>Verify & Unlock</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
