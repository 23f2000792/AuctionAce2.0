"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Progress } from './ui/progress';
import { Player } from '@/lib/player-data';

interface PresentationPlayer extends Player {
  orderNumber: number;
}

interface FullScreenViewProps {
  players: PresentationPlayer[];
}

export default function FullScreenView({ players }: FullScreenViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextPlayer = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, players.length - 1));
  }, [players.length]);

  const prevPlayer = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        nextPlayer();
      } else if (event.key === 'ArrowLeft') {
        prevPlayer();
      } else if (event.key === 'Escape') {
        document.exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextPlayer, prevPlayer]);

  const handleExitFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const currentPlayer = players[currentIndex];
  const progressPercentage = players.length > 0 ? ((currentIndex + 1) / players.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4 z-[100]">
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
        <div className="w-full flex items-center justify-center">
            <Button
                variant="outline"
                size="icon"
                onClick={prevPlayer}
                disabled={currentIndex === 0}
                className="absolute left-0 h-16 w-16 rounded-full"
                aria-label="Previous Player"
            >
                <ArrowLeft className="h-8 w-8" />
            </Button>

            {players.map((player, index) => (
                <div 
                    key={player.id}
                    className="absolute w-full transition-all duration-500 ease-in-out"
                    style={{
                        transform: `translateX(${(index - currentIndex) * 110}%) scale(${index === currentIndex ? 1 : 0.8})`,
                        opacity: index === currentIndex ? 1 : 0,
                        zIndex: players.length - Math.abs(index - currentIndex)
                    }}
                >
                    <Card className="w-full aspect-video flex flex-col items-center justify-center shadow-2xl">
                        <CardContent className="p-6 text-center">
                            <p className="text-2xl sm:text-3xl text-muted-foreground font-medium">#{player.playerNumber}</p>
                            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold font-headline mt-4">{player.playerName}</h1>
                        </CardContent>
                    </Card>
                </div>
            ))}
            
            <Button
                variant="outline"
                size="icon"
                onClick={nextPlayer}
                disabled={currentIndex === players.length - 1}
                className="absolute right-0 h-16 w-16 rounded-full"
                aria-label="Next Player"
            >
                <ArrowRight className="h-8 w-8" />
            </Button>
        </div>
      </div>
      
      <div className="w-full max-w-md p-4">
        <Progress value={progressPercentage} className="h-3" />
        <p className="text-center mt-2 text-sm text-muted-foreground font-medium">
            Player {currentIndex + 1} of {players.length}
        </p>
      </div>

    </div>
  );
}
