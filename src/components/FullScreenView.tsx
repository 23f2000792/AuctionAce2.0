'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, Gavel, Users, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Player } from '@/lib/player-data';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FullScreenViewProps {
  players: Player[];
}

export default function FullScreenView({ players }: FullScreenViewProps) {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [drawnPlayers, setDrawnPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setAvailablePlayers([...players]);
    setDrawnPlayers([]);
    setCurrentPlayer(null);
  }, [players]);

  const handleDrawPlayer = useCallback(() => {
    if (availablePlayers.length === 0 || isDrawing) return;

    setIsDrawing(true);
    setCurrentPlayer(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availablePlayers.length);
      const drawnPlayer = availablePlayers[randomIndex];

      setCurrentPlayer(drawnPlayer);
      setAvailablePlayers((prev) => prev.filter((p) => p.id !== drawnPlayer.id));
      setDrawnPlayers((prev) => [drawnPlayer, ...prev]);
      setIsDrawing(false);
    }, 2500); // Suspense duration
  }, [availablePlayers, isDrawing]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handleDrawPlayer();
      } else if (event.key === 'Escape') {
        router.push('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleDrawPlayer, router]);

  const cardVariants = {
    hidden: { opacity: 0, y: 100, scale: 0.8, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
    exit: { opacity: 0, y: -100, scale: 0.8, filter: 'blur(10px)' },
  };

  return (
    <div className="fixed inset-0 bg-background/50 flex flex-col items-center justify-center p-4 z-[100] overflow-hidden">
      <AnimatePresence>
        <Collapsible
          open={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          className={cn(
            'absolute top-0 left-0 h-full z-10 transition-all duration-300',
            isSidebarOpen ? 'w-72' : 'w-16'
          )}
        >
          <CollapsibleTrigger asChild>
            <motion.button
              className="absolute top-1/2 -translate-y-1/2 left-full -ml-px w-5 h-24 bg-primary/20 hover:bg-primary/40 border-y-2 border-r-2 border-primary/50 rounded-r-lg flex items-center justify-center text-primary-foreground"
              initial={{ x: 0 }}
              animate={{ x: isSidebarOpen ? -1 : 0 }}
            >
              {isSidebarOpen ? <ChevronsLeft /> : <ChevronsRight />}
            </motion.button>
          </CollapsibleTrigger>
          <CollapsibleContent asChild>
            <motion.div
              className="h-full w-full bg-card/80 backdrop-blur-sm border-r border-primary/20 p-4 space-y-4"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
            >
              <h3 className="text-xl font-bold font-headline text-primary-foreground">
                Drawn Players ({drawnPlayers.length})
              </h3>
              <ul className="space-y-2 h-[calc(100%-4rem)] overflow-y-auto pr-2">
                {drawnPlayers.map((player, index) => (
                  <li
                    key={player.id}
                    className="flex items-center gap-3 p-2 bg-secondary/50 rounded-md text-left"
                  >
                    <span className="text-sm font-bold text-muted-foreground w-6">
                      {drawnPlayers.length - index}.
                    </span>
                    <span className="font-medium">{player.playerName}</span>
                    <span className="font-mono text-xs text-primary ml-auto">
                      #{player.playerNumber}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>
      </AnimatePresence>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push('/')}
        className="absolute top-4 right-4 h-12 w-12 rounded-full z-20"
      >
        <X className="h-8 w-8" />
        <span className="sr-only">Exit Full Screen</span>
      </Button>

      <div className="w-full max-w-5xl flex-1 flex flex-col justify-center items-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPlayer ? currentPlayer.id : 'waiting'}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
          >
            <Card className="w-full aspect-video flex flex-col items-center justify-center text-center">
              <CardContent className="p-6">
                {isDrawing ? (
                  <motion.div
                    key="drawing"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Gavel className="h-32 w-32 text-primary animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
                    <p className="mt-4 text-2xl font-headline tracking-widest uppercase">
                      Drawing...
                    </p>
                  </motion.div>
                ) : currentPlayer ? (
                  <div className="text-center">
                    <motion.p
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="text-4xl font-bold text-muted-foreground"
                    >
                      #{currentPlayer.playerNumber}
                    </motion.p>
                    <motion.h1
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="text-6xl sm:text-8xl md:text-9xl font-bold font-headline mt-4 tracking-tight"
                      style={{ textShadow: '0 0 15px hsl(var(--primary) / 0.5)' }}
                    >
                      {currentPlayer.playerName}
                    </motion.h1>
                  </div>
                ) : (
                  <div className="text-center">
                    <Users className="h-32 w-32 mx-auto text-muted-foreground" />
                    <h1 className="text-5xl font-bold font-headline mt-4">
                      {players.length > 0
                        ? 'Ready to Start the Auction?'
                        : 'No Players in this Set'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      Click "Draw Player" to begin.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-lg p-4 flex flex-col justify-center items-center gap-4">
        <Button
          onClick={handleDrawPlayer}
          disabled={availablePlayers.length === 0 || isDrawing}
          size="lg"
          className="rounded-full w-full max-w-xs h-16 text-2xl font-headline"
          style={{ animation: isDrawing ? 'none' : 'pulse 2s infinite' }}
        >
          <Gavel className="mr-4" />
          {availablePlayers.length === 0 ? 'Auction Over' : 'Draw Player'}
        </Button>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Players Remaining</p>
          <p className="text-xl font-bold">
            {availablePlayers.length} / {players.length}
          </p>
        </div>
      </div>
    </div>
  );
}
