"use client";

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Player, PlayerSet } from '@/lib/player-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Gavel, Users, Check, Star, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AuctionPage({ params }: { params: { slug: string } }) {
  const [remainingPlayers, setRemainingPlayers] = useState<Player[]>([]);
  const [drawnPlayer, setDrawnPlayer] = useState<Player | null>(null);
  const [auctionedPlayers, setAuctionedPlayers] = useState<Player[]>([]);
  const [set, setSet] = useState<PlayerSet | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedSets = localStorage.getItem('playerSets');
    if (storedSets) {
      const sets: PlayerSet[] = JSON.parse(storedSets);
      const currentSet = sets.find(s => String(s.id) === params.slug);
      if (currentSet) {
        setSet(currentSet);
        setRemainingPlayers(currentSet.players);
        setDrawnPlayer(null);
        setAuctionedPlayers([]);
      } else {
        notFound();
      }
    } else {
        // if no sets are in local storage, there's nothing to auction
        notFound();
    }
  }, [params.slug]);

  if (!set) {
    return null; // Or a loading spinner
  }

  const drawPlayer = () => {
    if (remainingPlayers.length === 0) {
      // Last player was drawn in previous click, now we move to finished state
      if(drawnPlayer) {
        setAuctionedPlayers(prev => [drawnPlayer, ...prev]);
        setDrawnPlayer(null);
      }
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * remainingPlayers.length);
    const selectedPlayer = remainingPlayers[randomIndex];
    
    if (drawnPlayer) {
        setAuctionedPlayers(prev => [drawnPlayer, ...prev]);
    }
    
    setDrawnPlayer(selectedPlayer);
    setRemainingPlayers(remainingPlayers.filter(p => p.id !== selectedPlayer.id));
  };
  
  const allPlayersInSet = set.players;
  const isAuctionFinished = remainingPlayers.length === 0 && drawnPlayer === null;
  const playersLeftCount = remainingPlayers.length + (drawnPlayer ? 1 : 0);

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        <div>
          <Button variant="outline" asChild className="mb-4">
              <Link href="/"><ArrowLeft className="mr-2" /> Back to Sets</Link>
          </Button>
          <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl font-headline">Auction Room: {set.name}</CardTitle>
                        <CardDescription>Draw players randomly for bidding.</CardDescription>
                    </div>
                     <div className="text-right">
                        <div className="text-2xl font-bold">{playersLeftCount}</div>
                        <div className="text-sm text-muted-foreground">Players Left</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
              {isAuctionFinished ? (
                 <div className="flex flex-col items-center gap-4 text-center">
                    <Check className="h-24 w-24 text-green-500 bg-green-500/10 p-4 rounded-full" />
                    <h2 className="text-3xl font-bold font-headline">Set Complete!</h2>
                    <p className="text-muted-foreground">All players in {set.name} have been auctioned.</p>
                     <Button asChild>
                        <Link href="/">Choose another set</Link>
                     </Button>
                </div>
              ) : drawnPlayer ? (
                <div className="w-full max-w-sm mx-auto animate-in fade-in zoom-in-95">
                  <Card className="shadow-2xl">
                    <CardContent className="p-0">
                      <Image
                        src={drawnPlayer.imageUrl}
                        alt={drawnPlayer.name}
                        width={400}
                        height={400}
                        className="rounded-t-lg aspect-square object-cover"
                        data-ai-hint="player photo"
                      />
                    </CardContent>
                    <div className="p-6 bg-background rounded-b-lg">
                       <h2 className="text-4xl font-bold font-headline">{drawnPlayer.name}</h2>
                       <p className="text-lg text-primary font-semibold mt-1">Up for auction!</p>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                    <Star className="h-24 w-24 text-yellow-400" />
                    <h2 className="text-2xl font-bold">Ready to Start?</h2>
                    <p className="text-muted-foreground">Click the button to draw the first player.</p>
                </div>
              )}
               <Button onClick={drawPlayer} disabled={isAuctionFinished} size="lg" className="mt-8">
                 <Gavel className="mr-2" />
                 {isAuctionFinished ? 'Finished!' : drawnPlayer ? 'Draw Next Player' : 'Draw First Player'}
               </Button>
               {remainingPlayers.length === 0 && drawnPlayer && <p className="text-sm text-muted-foreground mt-4">This is the last player in the set!</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center"><Users className="mr-2"/>Players in this Set</CardTitle>
             <div className="text-sm font-medium text-muted-foreground">{allPlayersInSet.length} total</div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px] pr-4">
              <ul className="space-y-2">
                {allPlayersInSet.map(player => (
                  <li key={player.id} className={`flex items-center gap-3 p-2 rounded-md ${auctionedPlayers.find(p=>p.id === player.id) ? 'bg-muted/50 opacity-50' : 'bg-secondary'}`}>
                    <Image
                      src={player.imageUrl}
                      alt={player.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                      data-ai-hint="player photo"
                    />
                    <span className={`font-medium ${auctionedPlayers.find(p=>p.id === player.id) ? 'line-through' : ''}`}>{player.name}</span>
                    {auctionedPlayers.find(p=>p.id === player.id) && <Check className="h-5 w-5 ml-auto text-green-500"/>}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><Check className="mr-2"/>Auctioned Players</CardTitle>
            </CardHeader>
            <CardContent>
                 <ScrollArea className="h-[250px] pr-4">
                    {auctionedPlayers.length === 0 ? (
                        <p className="text-center text-muted-foreground py-10">Drawn players will appear here.</p>
                    ) : (
                        <ul className="space-y-2">
                            {auctionedPlayers.map(player => (
                                <li key={player.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                                    <Image
                                        src={player.imageUrl}
                                        alt={player.name}
                                        width={32}
                                        height={32}
                                        className="h-8 w-8 rounded-full"
                                        data-ai-hint="player photo"
                                    />
                                    <span className="font-medium text-muted-foreground">{player.name}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                 </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
