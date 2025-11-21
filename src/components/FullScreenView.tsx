'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { List, X, Gavel } from 'lucide-react';
import { Player } from '@/lib/player-data';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { AnimatePresence, motion } from 'framer-motion';

interface PresentationPlayer extends Player {
  orderNumber?: number;
}

interface FullScreenViewProps {
  players: PresentationPlayer[];
}

export default function FullScreenView({ players }: FullScreenViewProps) {
  const [availablePlayers, setAvailablePlayers] = useState<
    PresentationPlayer[]
  >([]);
  const [drawnPlayers, setDrawnPlayers] = useState<PresentationPlayer[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PresentationPlayer | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    // Initial shuffle of players into the available pool
    const shuffle = (array: PresentationPlayer[]) => {
      let currentIndex = array.length,
        randomIndex;
      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex],
        ];
      }
      return array;
    };
    setAvailablePlayers(shuffle([...players]));
    setDrawnPlayers([]);
    setCurrentPlayer(null);
  }, [players]);

  const drawPlayer = useCallback(() => {
    if (availablePlayers.length > 0) {
      setIsDrawing(true);
      setTimeout(() => {
        const nextPlayer = availablePlayers[0];
        setCurrentPlayer(nextPlayer);
        setDrawnPlayers((prev) => [nextPlayer, ...prev]);
        setAvailablePlayers((prev) => prev.slice(1));
        setIsDrawing(false);
      }, 1500); // Suspense duration
    }
  }, [availablePlayers]);

  const handleExitFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const getCardContent = () => {
    if (isDrawing) {
      return (
        <motion.div
          key="drawing"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <motion.div
            animate={{ rotate: [-15, 15, -15] }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Gavel className="h-24 w-24 text-primary" />
          </motion.div>
          <h2 className="text-4xl font-headline text-muted-foreground animate-pulse">
            Drawing Player...
          </h2>
        </motion.div>
      );
    }
    if (currentPlayer) {
      return (
        <motion.div
          key={currentPlayer.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-4xl font-bold text-muted-foreground"
          >
            #{currentPlayer.playerNumber}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-6xl sm:text-8xl md:text-9xl font-bold font-headline mt-4 tracking-tight"
          >
            {currentPlayer.playerName}
          </motion.h1>
        </motion.div>
      );
    }
    if (availablePlayers.length > 0) {
      return (
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold font-headline">
          Ready to Draw
        </h1>
      );
    }
    return (
      <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold font-headline">
        Auction Finished
      </h1>
    );
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4 z-[100] overflow-hidden">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 left-4 h-12 w-12 rounded-full"
          >
            <List className="h-6 w-6" />
            <span className="sr-only">Show Drawn Players</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Drawn Players ({drawnPlayers.length})</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)] pr-4">
            <ul className="space-y-3 py-4">
              {drawnPlayers.map((player, index) => (
                <li
                  key={player.id}
                  className={`flex items-center gap-3 p-3 rounded-md transition-all duration-300 ${
                    index === 0
                      ? 'bg-primary/20 scale-105'
                      : 'bg-secondary opacity-70'
                  }`}
                >
                  <span className="font-mono text-muted-foreground w-8 text-center">
                    #{player.playerNumber}
                  </span>
                  <span className="font-medium">{player.playerName}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleExitFullScreen}
        className="absolute top-4 right-4 h-12 w-12 rounded-full"
      >
        <X className="h-8 w-8" />
        <span className="sr-only">Exit Full Screen</span>
      </Button>

      <div className="w-full max-w-5xl flex-1 flex flex-col justify-center items-center relative">
        <Card className="w-full aspect-video flex flex-col items-center justify-center shadow-2xl bg-card/80 backdrop-blur-sm border-primary/20">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">{getCardContent()}</AnimatePresence>
          </CardContent>
        </Card>
      </div>

      <div className="w-full max-w-md p-4 flex flex-col items-center gap-4">
        <Button
          onClick={drawPlayer}
          disabled={availablePlayers.length === 0 || isDrawing}
          size="lg"
          className="w-full text-xl h-16 rounded-full shadow-lg"
        >
          <Gavel className="mr-3 h-6 w-6" />
          {isDrawing
            ? 'Drawing...'
            : `Draw Player (${availablePlayers.length} left)`}
        </Button>
      </div>
    </div>
  );
}
