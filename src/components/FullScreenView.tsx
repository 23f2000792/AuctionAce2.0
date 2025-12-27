
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
    // Initial shuffle of players
    setAvailablePlayers([...players].sort(() => Math.random() - 0.5));
    setDrawnPlayers([]);
    setCurrentPlayer(null);
  }, [players]);

  const handleDrawPlayer = useCallback(() => {
    if (availablePlayers.length === 0 || isDrawing) return;

    setIsDrawing(true);
    setCurrentPlayer(null);

    // Suspense and reveal animation
    setTimeout(() => {
      const [drawnPlayer, ...remainingPlayers] = availablePlayers;

      setCurrentPlayer(drawnPlayer);
      setAvailablePlayers(remainingPlayers);
      setDrawnPlayers((prev) => [drawnPlayer, ...prev]);
      setIsDrawing(false);
    }, 1500);
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

  const drawnPlayerListVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const drawnPlayerItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4 z-[100] overflow-hidden">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute top-0 left-0 h-full z-10 w-72"
          >
            <div className="h-full w-full bg-card/80 backdrop-blur-sm border-r border-primary/20 p-4 space-y-4">
              <h3 className="text-xl font-bold text-primary-foreground">
                Drawn Players ({drawnPlayers.length})
              </h3>
              <AnimatePresence>
                <motion.ul
                  variants={drawnPlayerListVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2 h-[calc(100%-4rem)] overflow-y-auto pr-2"
                >
                  {drawnPlayers.map((player, index) => (
                    <motion.li
                      key={player.id}
                      variants={drawnPlayerItemVariants}
                      className="flex items-center gap-3 p-2 bg-secondary/50 rounded-md text-left"
                    >
                      <span className="text-sm font-bold text-muted-foreground w-6">
                        {drawnPlayers.length - index}.
                      </span>
                      <span className="font-medium">{player.playerName}</span>
                      <span className="font-mono text-xs text-primary ml-auto">
                        #{player.playerNumber}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Collapsible
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-300',
          isSidebarOpen ? 'left-72' : 'left-0'
        )}
      >
        <CollapsibleTrigger asChild>
          <motion.button className="w-5 h-24 bg-primary/20 hover:bg-primary/40 border-y-2 border-r-2 border-primary/50 rounded-r-lg flex items-center justify-center text-primary-foreground">
            {isSidebarOpen ? <ChevronsLeft /> : <ChevronsRight />}
          </motion.button>
        </CollapsibleTrigger>
      </Collapsible>

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
              <CardContent className="p-6 w-full">
                {isDrawing ? (
                  <motion.div
                    key="drawing"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Gavel className="h-24 w-24 sm:h-32 sm:w-32 text-primary animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
                    <p className="mt-4 text-xl sm:text-2xl tracking-widest uppercase">
                      Drawing...
                    </p>
                  </motion.div>
                ) : currentPlayer ? (
                  <div className="text-center flex flex-col items-center justify-center h-full">
                    <motion.p
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="text-2xl sm:text-3xl font-bold text-muted-foreground"
                    >
                      #{currentPlayer.playerNumber}
                    </motion.p>
                    <motion.h1
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="text-5xl sm:text-7xl font-bold mt-2 tracking-tight"
                      style={{ textShadow: '0 0 15px hsl(var(--primary) / 0.5)' }}
                    >
                      {currentPlayer.playerName}
                    </motion.h1>
                    <motion.div 
                        className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-4 mt-8 text-sm sm:text-base"
                        initial="hidden"
                        animate="visible"
                        variants={{
                           visible: { 
                            opacity: 1, y: 0, 
                            transition: { delay: 0.5, duration: 0.4, staggerChildren: 0.1 }
                          },
                           hidden: { opacity: 0, y: 20 },
                        }}
                    >
                        {currentPlayer.country && 
                          <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-2 bg-secondary/10 rounded-md">
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Country</span>
                            <span className="font-semibold">{currentPlayer.country}</span>
                          </motion.div>
                        }
                        {currentPlayer.specialism && 
                          <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-2 bg-secondary/10 rounded-md">
                             <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Specialism</span>
                            <span className="font-semibold">{currentPlayer.specialism}</span>
                           </motion.div>
                        }
                        {currentPlayer.cua && 
                          <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-2 bg-secondary/10 rounded-md">
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Status</span>
                            <span className="font-semibold">{currentPlayer.cua}</span>
                          </motion.div>
                        }
                        {currentPlayer.reservePrice != null && currentPlayer.reservePrice > 0 &&
                           <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-2 bg-secondary/10 rounded-md">
                             <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Reserve Price</span>
                             <span className="font-semibold">{currentPlayer.reservePrice} Lakh</span>
                           </motion.div>
                        }
                        {currentPlayer.points != null &&
                          <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-2 bg-secondary/10 rounded-md">
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Points</span>
                            <span className="font-semibold">{currentPlayer.points}</span>
                          </motion.div>
                        }
                    </motion.div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Users className="h-24 w-24 sm:h-32 sm:w-32 mx-auto text-muted-foreground" />
                    <h1 className="text-3xl sm:text-5xl font-bold mt-4">
                      {players.length > 0
                        ? 'Ready to Start?'
                        : 'No Players in this Set'}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">
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
          className="w-full max-w-xs h-16 text-xl sm:text-2xl"
          style={{ animation: !isDrawing && availablePlayers.length > 0 ? 'pulse-slow 2s infinite' : 'none' }}
        >
          <Gavel className="mr-4" />
          {availablePlayers.length === 0 ? 'Auction Over' : 'Draw Player'}
        </Button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Players Remaining</p>
          <p className="text-lg font-bold">
            {availablePlayers.length} / {players.length}
          </p>
        </div>
      </div>
    </div>
  );
}
