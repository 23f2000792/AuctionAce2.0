
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, Gavel, Users, ChevronsLeft, ChevronsRight, Repeat } from 'lucide-react';
import { Player, PlayerSet } from '@/lib/player-data';
import { AnimatePresence, motion } from 'framer-motion';
import { cn, shuffleArray } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FullScreenViewProps {
  players: Player[];
  set: PlayerSet;
}

const Starfield = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      let animationFrameId: number;
      const stars: { x: number; y: number; z: number }[] = [];
      const numStars = 300;
  
      const resize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        stars.length = 0; // Reset stars on resize
        for (let i = 0; i < numStars; i++) {
          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            z: Math.random() * canvas.width,
          });
        }
      };
  
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'hsl(var(--primary-foreground))';
        
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
  
        for (let i = 0; i < numStars; i++) {
          const star = stars[i];
          star.z -= 1;
  
          if (star.z <= 0) {
            star.z = canvas.width;
          }
  
          const k = 128 / star.z;
          const px = star.x * k + canvas.width / 2;
          const py = star.y * k + canvas.height / 2;
  
          if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
            const size = ((1 - star.z / canvas.width) * 5);
            ctx.beginPath();
            ctx.arc(px - canvas.width/2, py - canvas.height/2, size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
        animationFrameId = requestAnimationFrame(draw);
      };
      
      resize();
      draw();
  
      window.addEventListener('resize', resize);
      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
      };
    }, []);
  
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-20" />;
};
  

export default function FullScreenView({ players, set }: FullScreenViewProps) {
  const [activePlayerList, setActivePlayerList] = useState<Player[]>(() => shuffleArray(players));
  const [undrawnPlayers, setUndrawnPlayers] = useState<Player[]>([...activePlayerList]);
  const [drawnPlayers, setDrawnPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  
  const drawingInterval = useRef<NodeJS.Timeout>();
  const [drawingDisplayPlayer, setDrawingDisplayPlayer] = useState<Player | null>(null);


  const stopDrawingAnimation = useCallback(() => {
    if (drawingInterval.current) {
        clearInterval(drawingInterval.current);
        drawingInterval.current = undefined;
    }
    setDrawingDisplayPlayer(null);
  }, []);

  const handleDrawPlayer = useCallback(() => {
    if (undrawnPlayers.length === 0 || isDrawing) return;

    setIsDrawing(true);
    setCurrentPlayer(null); // Clear current player for animation

    // Start the "slot machine" animation
    drawingInterval.current = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * undrawnPlayers.length);
        setDrawingDisplayPlayer(undrawnPlayers[randomIndex]);
    }, 100);

    setTimeout(() => {
      stopDrawingAnimation();
      const randomIndex = Math.floor(Math.random() * undrawnPlayers.length);
      const newDrawnPlayer = undrawnPlayers[randomIndex];
      
      setCurrentPlayer(newDrawnPlayer);
      setDrawnPlayers(prev => [newDrawnPlayer, ...prev]);
      setUndrawnPlayers(prev => prev.filter(p => p.id !== newDrawnPlayer.id));
      setIsDrawing(false);
    }, 2500); // Suspense duration
  }, [isDrawing, undrawnPlayers, stopDrawingAnimation]);
  
  const resetAuction = () => {
    stopDrawingAnimation();
    const newShuffledList = shuffleArray(players);
    setActivePlayerList(newShuffledList);
    setUndrawnPlayers([...newShuffledList]);
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
      stopDrawingAnimation();
    };
  }, [handleKeyDown, stopDrawingAnimation]);

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
                      <span className="font-mono text-xs text-primary-foreground ml-auto">
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
            <Card 
              className="w-full aspect-video flex flex-col items-center justify-center text-center bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm border-primary/20 glow-border relative overflow-hidden"
              style={{
                boxShadow: 'inset 0 0 40px hsl(var(--primary) / 0.1)',
              }}
            >
              <Starfield />
              <CardContent className="p-6 w-full z-10">
                {isDrawing ? (
                   <motion.div
                      key="drawing"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <p className="font-mono text-2xl sm:text-4xl font-bold text-muted-foreground animate-pulse">
                        #{drawingDisplayPlayer?.playerNumber || '??'}
                      </p>
                      <h1 className="text-5xl sm:text-7xl mt-2 text-primary font-headline" style={{ textShadow: '0 0 15px hsl(var(--primary) / 0.6)' }}>
                        {drawingDisplayPlayer?.playerName || 'Drawing...'}
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
                      className="text-5xl sm:text-7xl mt-2 truncate bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-headline"
                       style={{ filter: 'drop-shadow(0 0 10px hsl(var(--accent) / 0.4))' }}
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
                          <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-3 bg-primary/5 rounded-lg border border-primary/20 backdrop-blur-sm">
                            <span className="text-sm text-primary font-bold uppercase tracking-wider">Country</span>
                            <span className="font-semibold text-lg truncate">{currentPlayer.country}</span>
                          </motion.div>
                        }
                        {currentPlayer.specialism && 
                          <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-3 bg-primary/5 rounded-lg border border-primary/20 backdrop-blur-sm">
                             <span className="text-sm text-primary font-bold uppercase tracking-wider">Specialism</span>
                            <span className="font-semibold text-lg truncate">{currentPlayer.specialism}</span>
                           </motion.div>
                        }
                        {currentPlayer.cua && 
                          <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-3 bg-primary/5 rounded-lg border border-primary/20 backdrop-blur-sm">
                            <span className="text-sm text-primary font-bold uppercase tracking-wider">Status</span>
                            <span className="font-semibold text-lg truncate">{currentPlayer.cua}</span>
                          </motion.div>
                        }
                        {currentPlayer.reservePrice != null && currentPlayer.reservePrice > 0 &&
                           <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-3 bg-secondary/10 rounded-lg border border-secondary/30 backdrop-blur-sm">
                             <span className="text-sm text-secondary font-bold uppercase tracking-wider">Reserve Price</span>
                             <span className="font-mono font-semibold text-lg truncate">{currentPlayer.reservePrice} Lakh</span>
                           </motion.div>
                        }
                        {currentPlayer.points != null &&
                          <motion.div variants={drawnPlayerItemVariants} className="flex flex-col p-3 bg-secondary/10 rounded-lg border border-secondary/30 backdrop-blur-sm">
                            <span className="text-sm text-secondary font-bold uppercase tracking-wider">Points</span>
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
            className="h-20 w-80 text-2xl btn-glow font-headline"
          >
            <Gavel className="mr-4 h-8 w-8" />
            {isDrawing ? 'Drawing...' : 'Draw Player'}
          </Button>
        ) : (
            <Button
              onClick={resetAuction}
              size="lg"
              className="h-20 w-80 text-2xl btn-glow font-headline"
              variant="outline"
            >
              <Repeat className="mr-4 h-8 w-8"/>
              Reset Auction
            </Button>
        )}
        <p className="text-sm text-muted-foreground">
          {undrawnPlayers.length} / {activePlayerList.length} players remaining
        </p>
      </div>
    </div>
  );
}
