'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { AuctionOrderItem } from '@/lib/player-data';
import { AnimatePresence, motion } from 'framer-motion';

interface FullScreenViewProps {
  auctionOrder: AuctionOrderItem[];
}

export default function FullScreenView({ auctionOrder }: FullScreenViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, auctionOrder.length -1));
  }, [auctionOrder.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        handlePrev();
      } else if (event.key === 'Escape') {
        router.push('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev, router]);

  const currentPlayer = auctionOrder[currentIndex];

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4 z-[100] overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push('/')}
        className="absolute top-4 right-4 h-12 w-12 rounded-full"
      >
        <X className="h-8 w-8" />
        <span className="sr-only">Exit Full Screen</span>
      </Button>

      <div className="w-full max-w-5xl flex-1 flex flex-col justify-center items-center relative">
        <Card className="w-full aspect-video flex flex-col items-center justify-center shadow-2xl bg-card/80 backdrop-blur-sm border-primary/20">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {currentPlayer && (
                <motion.div
                  key={currentPlayer.player.id}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="text-center"
                >
                  <motion.p
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="text-4xl font-bold text-muted-foreground"
                  >
                    #{currentPlayer.player.playerNumber}
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-6xl sm:text-8xl md:text-9xl font-bold font-headline mt-4 tracking-tight"
                  >
                    {currentPlayer.player.playerName}
                  </motion.h1>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

       <div className="w-full max-w-md p-4 flex justify-between items-center gap-4">
        <Button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          size="lg"
          variant="outline"
          className="rounded-full"
        >
          <ArrowLeft className="mr-2" />
          Previous
        </Button>
         <div className="text-center">
            <p className="text-sm text-muted-foreground">Player</p>
            <p className="text-xl font-bold">{currentIndex + 1} / {auctionOrder.length}</p>
        </div>
        <Button
          onClick={handleNext}
          disabled={currentIndex === auctionOrder.length - 1}
          size="lg"
          className="rounded-full"
        >
          Next
          <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
