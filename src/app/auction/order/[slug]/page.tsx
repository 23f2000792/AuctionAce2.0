'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Player, PlayerSet } from '@/lib/player-data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  useUser,
  useFirestore,
  useDoc,
  updateDocumentNonBlocking,
  useMemoFirebase,
} from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { shuffleArray, hashPin } from '@/lib/utils';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  ShieldCheck,
  Shuffle,
  Lock,
  ArrowLeft,
  Presentation,
  KeyRound,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';
import { suggestPin } from '@/ai/flows/suggest-pin';

export default function AuctionOrderPage() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [pin, setPin] = useState('');
  const [isPinValid, setIsPinValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { slug } = params;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const setRef = useMemoFirebase(() => {
    if (!firestore || typeof slug !== 'string') return null;
    return doc(firestore, 'sets', slug) as DocumentReference<PlayerSet>;
  }, [firestore, slug]);

  const { data: set, isLoading: isLoadingSet } = useDoc<PlayerSet>(setRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    } else if (set && user && set.userId !== user.uid) {
      notFound();
    }
  }, [user, isUserLoading, router, set]);

  useEffect(() => {
    if (isPinValid && set?.order) {
      router.push(`/auction/present/${slug}`);
    }
  }, [isPinValid, set, slug, router]);

  const generateOrder = async () => {
    if (!set || !setRef || !user) return;
    setIsProcessing(true);
    try {
      const shuffledPlayers = shuffleArray(set.players);
      const auctionOrder = shuffledPlayers.map((player, index) => ({
        player,
        orderNumber: index + 1,
      }));

      const { pin: suggestedPin } = await suggestPin();
      const pinHash = await hashPin(suggestedPin);

      await updateDocumentNonBlocking(setRef, {
        order: auctionOrder,
        pinHash,
      });

      toast({
        title: 'Auction Order Secured!',
        description: `A new random order has been generated and secured with PIN: ${suggestedPin}`,
        duration: 10000,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: 'Error Generating Order',
        description:
          'Could not generate a new auction order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePinChange = (value: string) => {
    setPin(value);
  };

  const handlePinComplete = async (value: string) => {
    if (!set?.pinHash) return;
    setIsProcessing(true);
    try {
      const enteredPinHash = await hashPin(value);
      if (enteredPinHash === set.pinHash) {
        setIsPinValid(true);
        toast({
          title: 'PIN Accepted!',
          description: 'Taking you to the presentation screen.',
        });
      } else {
        toast({
          title: 'Invalid PIN',
          description: 'The PIN you entered is incorrect.',
          variant: 'destructive',
        });
        setPin(''); // Reset PIN input
      }
    } catch (error) {
      toast({
        title: 'Error Validating PIN',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestNewPin = async () => {
    setIsProcessing(true);
    const { pin } = await suggestPin();
    toast({
      title: 'Suggested PIN',
      description: `How about using ${pin}?`,
    });
    setIsProcessing(false);
  };

  const isLoading = isLoadingSet || isUserLoading || isProcessing;

  if (isLoading && !set) {
    return <div className="text-center">Loading auction setup...</div>;
  }

  if (!set) {
    notFound();
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Button variant="outline" asChild className="mb-4">
        <Link href="/">
          <ArrowLeft className="mr-2" /> Back to Sets
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">
            Auction Setup: {set.name}
          </CardTitle>
          <CardDescription>
            Secure your auction order and start the presentation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {set.order ? (
            <div className="text-center space-y-4">
              <ShieldCheck className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold">
                Auction Order is Secured
              </h3>
              <p className="text-muted-foreground">
                A random order has been generated for this set. To begin the
                auction, enter the 4-digit PIN.
              </p>
              <div className="flex flex-col items-center gap-4">
                <InputOTP
                  maxLength={4}
                  value={pin}
                  onChange={handlePinChange}
                  onComplete={handlePinComplete}
                  disabled={isProcessing}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
                <Button
                  onClick={() => handlePinComplete(pin)}
                  disabled={pin.length !== 4 || isProcessing}
                >
                  <KeyRound className="mr-2" />
                  Unlock & Start
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Lock className="h-16 w-16 text-yellow-400 mx-auto" />
              <h3 className="text-xl font-semibold">
                Generate Secure Auction Order
              </h3>
              <p className="text-muted-foreground">
                Click the button below to randomly shuffle the players in this
                set and secure the order with a new 4-digit PIN.
              </p>
              <div className="flex justify-center items-center gap-2">
                <Button
                  onClick={generateOrder}
                  disabled={isProcessing}
                  size="lg"
                >
                  <Shuffle className="mr-2" /> Generate & Secure Order
                </Button>
                <Button
                  onClick={suggestNewPin}
                  disabled={isProcessing}
                  variant="outline"
                  size="icon"
                  aria-label="Suggest PIN"
                >
                  <Lightbulb />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        {set.order && (
          <CardFooter className="flex flex-col gap-4 border-t pt-6">
            <Button
              asChild
              className="w-full"
              disabled={!isPinValid}
            >
              <Link href={`/auction/present/${slug}`}>
                <Presentation className="mr-2" /> Go to Presentation
              </Link>
            </Button>
            <Button
              onClick={generateOrder}
              variant="destructive"
              className="w-full"
              disabled={isProcessing}
            >
              <Shuffle className="mr-2" /> Reset and Generate New Order
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
