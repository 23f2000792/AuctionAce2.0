
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, Gavel, Users, ChevronsLeft, ChevronsRight, Repeat } from 'lucide-react';
import { Player, PlayerSet } from '@/lib/player-data';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FullScreenViewProps {
  players: Player[];
  set: PlayerSet;
}

export default function FullScreenView({ players, set }: FullScreenViewProps) {
  const [undrawnPlayers, setUndrawnPlayers] = useState<Player[]>([...players]);
  const [drawnPlayers, setDrawnPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleDrawPlayer = () => {
    if (undrawnPlayers.length === 0 || isDrawing) return;

    setIsDrawing(true);
    setCurrentPlayer(null); // Clear current player for animation

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * undrawnPlayers.length);
      const newDrawnPlayer = undrawnPlayers[randomIndex];
      
      setCurrentPlayer(newDrawnPlayer);
      setDrawnPlayers(prev => [newDrawnPlayer, ...prev]);
      setUndrawnPlayers(prev => prev.filter(p => p.id !== newDrawnPlayer.id));
      setIsDrawing(false);
    }, 1500); // Suspense duration
  };
  
  const resetAuction = () => {
    setUndrawnPlayers([...players]);
    setDrawnPlayers([]);
    setCurrentPlayer(null);
    setIsDrawing(false);
  }

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handleDrawPlayer();
      } else if (event.key === 'Escape') {
        router.push('/');
      }
    }, [handleDrawPlayer, router]
  );


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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
        stiffness: 80,
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
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4 overflow-hidden">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute top-0 left-0 h-full z-30 w-72"
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
                      layout
                      variants={drawnPlayerItemVariants}
                      className="flex items-center gap-3 p-2 rounded-md bg-secondary/50"
                    >
                      <span className="text-sm font-bold text-muted-foreground w-6">
                        {drawnPlayers.length - index}.
                      </span>
                      <span className="font-medium truncate">{player.playerName}</span>
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
          'absolute top-1/2 -translate-y-1/2 z-40 transition-all duration-300',
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
        className="absolute top-4 right-4 h-12 w-12 rounded-full z-40"
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
            <Card className="w-full aspect-video flex flex-col items-center justify-center text-center bg-card/30 backdrop-blur-sm border-primary/20 glow-border">
              <CardContent className="p-6 w-full">
                {isDrawing ? (
                   <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <h1 className="text-5xl sm:text-7xl font-headline text-primary animate-pulse" style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.8)' }}>
                        Drawing...
                      </h1>
                    </motion.div>
                ) : currentPlayer ? (
                  <div className="text-center flex flex-col items-center justify-center h-full">
                    <motion.p
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="font-mono text-2xl sm:text-4xl font-bold text-muted-foreground"
                    >
                      #{currentPlayer.playerNumber}
                    </motion.p>
                    <motion.h1
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="text-5xl sm:text-7xl font-headline mt-2 truncate bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                      style={{ textShadow: '0 0 40px hsl(var(--primary) / 0.5)' }}
                    >
                      {currentPlayer.playerName}
                    </motion.h1>
                    <motion.div 
                        className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8 text-base"
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
                          <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-3 bg-background/50 rounded-lg border border-border/50">
                            <span className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Country</span>
                            <span className="font-semibold text-lg truncate">{currentPlayer.country}</span>
                          </motion.div>
                        }
                        {currentPlayer.specialism && 
                          <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-3 bg-background/50 rounded-lg border border-border/50">
                             <span className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Specialism</span>
                            <span className="font-semibold text-lg truncate">{currentPlayer.specialism}</span>
                           </motion.div>
                        }
                        {currentPlayer.cua && 
                          <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-3 bg-background/50 rounded-lg border border-border/50">
                            <span className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Status</span>
                            <span className="font-semibold text-lg truncate">{currentPlayer.cua}</span>
                          </motion.div>
                        }
                        {currentPlayer.reservePrice != null && currentPlayer.reservePrice > 0 &&
                           <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-3 bg-background/50 rounded-lg border border-border/50">
                             <span className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Reserve Price</span>
                             <span className="font-mono font-semibold text-lg truncate">{currentPlayer.reservePrice} Lakh</span>
                           </motion.div>
                        }
                        {currentPlayer.points != null &&
                          <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-3 bg-background/50 rounded-lg border border-border/50">
                            <span className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Points</span>
                            <span className="font-mono font-semibold text-lg truncate">{currentPlayer.points}</span>
                          </motion.div>
                        }
                    </motion.div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Users className="h-24 w-24 sm:h-32 sm:w-32 mx-auto text-muted-foreground" />
                    <h1 className="text-4xl sm:text-6xl font-headline mt-4">
                      {undrawnPlayers.length > 0
                        ? 'Ready to Draw'
                        : 'Auction Complete!'}
                    </h1>
                     <p className="text-muted-foreground mt-2 text-lg">
                       {undrawnPlayers.length > 0 ? 'Click "Draw Player" to begin.' : 'All players have been drawn.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-lg p-4 flex flex-col justify-center items-center gap-4">
        {undrawnPlayers.length > 0 ? (
          <Button
            onClick={handleDrawPlayer}
            disabled={isDrawing}
            size="lg"
            className="h-20 w-80 text-2xl font-headline btn-glow"
          >
            <Gavel className="mr-4 h-8 w-8" />
            {isDrawing ? 'Drawing...' : 'Draw Player'}
          </Button>
        ) : (
            <Button
              onClick={resetAuction}
              size="lg"
              className="h-20 w-80 text-2xl font-headline btn-glow"
              variant="outline"
            >
              <Repeat className="mr-4 h-8 w-8"/>
              Reset Auction
            </Button>
        )}
        <p className="text-sm text-muted-foreground">
          {undrawnPlayers.length} / {players.length} players remaining
        </p>
      </div>
    </div>
  );
}
