"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { List, X, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { Player } from '@/lib/player-data';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';

interface PresentationPlayer extends Player {
  orderNumber?: number; // orderNumber is now optional
}

interface FullScreenViewProps {
  players: PresentationPlayer[];
}

export default function FullScreenView({ players }: FullScreenViewProps) {
  const [availablePlayers, setAvailablePlayers] = useState<PresentationPlayer[]>([]);
  const [drawnPlayers, setDrawnPlayers] = useState<PresentationPlayer[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PresentationPlayer | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
      const nextPlayer = availablePlayers[0];
      setCurrentPlayer(nextPlayer);
      setDrawnPlayers((prev) => [nextPlayer, ...prev]);
      setAvailablePlayers((prev) => prev.slice(1));
    }
  }, [availablePlayers]);
  
  const handleExitFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };


  const getCardContent = () => {
    if (currentPlayer) {
      return (
        <>
          <p className="text-2xl sm:text-3xl text-muted-foreground font-medium">#{currentPlayer.playerNumber}</p>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold font-headline mt-4">{currentPlayer.playerName}</h1>
        </>
      );
    }
    if (availablePlayers.length > 0) {
      return <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold font-headline">Ready to Draw</h1>;
    }
    return <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold font-headline">Auction Finished</h1>;
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4 z-[100]">

       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
           <Button variant="outline" size="icon" className="absolute top-4 left-4 h-12 w-12">
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
                 <li key={player.id} className={`flex items-center gap-3 p-3 rounded-md ${index === 0 ? 'bg-primary/20' : 'bg-secondary'}`}>
                    <span className="font-mono text-muted-foreground w-8 text-center">#{player.playerNumber}</span>
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
        className="absolute top-4 right-4 h-12 w-12"
      >
        <X className="h-8 w-8" />
        <span className="sr-only">Exit Full Screen</span>
      </Button>
      
      <div className="w-full max-w-4xl flex-1 flex flex-col justify-center items-center relative">
         <Card className="w-full aspect-video flex flex-col items-center justify-center shadow-2xl transition-all duration-300 ease-in-out">
            <CardContent className="p-6 text-center">
              {getCardContent()}
            </CardContent>
          </Card>
      </div>
      
      <div className="w-full max-w-md p-4 flex flex-col items-center gap-4">
         <Button onClick={drawPlayer} disabled={availablePlayers.length === 0} size="lg" className="w-full text-lg">
            Draw Player ({availablePlayers.length} left)
        </Button>
      </div>

    </div>
  );
}
