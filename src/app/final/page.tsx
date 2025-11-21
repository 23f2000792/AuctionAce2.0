"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { format } from 'date-fns';
import FullScreenView from '@/components/FullScreenView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Expand, List, Lock } from 'lucide-react';

interface Player {
  id: string;
  playerName: string;
  orderNumber: number;
}

export default function FinalPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auctionDocRef = doc(db, 'auctions', 'default');
        const auctionDocSnap = await getDoc(auctionDocRef);

        if (!auctionDocSnap.exists() || !auctionDocSnap.data().locked) {
          setError('No locked auction found. Please generate one first.');
          setIsLoading(false);
          return;
        }

        setGeneratedAt(auctionDocSnap.data().generatedAt.toDate());

        const orderCollectionRef = collection(db, 'auctions', 'default', 'order');
        const q = query(orderCollectionRef, orderBy('orderNumber'));
        const orderQuerySnap = await getDocs(q);

        const fetchedPlayers = orderQuerySnap.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as Player));

        setPlayers(fetchedPlayers);
      } catch (err) {
        console.error(err);
        setError('Failed to load auction data. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFullScreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
      });
      setIsFullScreen(true);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  if (isFullScreen) {
    return <FullScreenView players={players} />;
  }
  
  const PageLoader = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[...Array(5)].map((_, i) => (
           <Skeleton key={i} className="h-12 w-full" />
        ))}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return <p className="text-destructive text-center">{error}</p>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline">
            <Lock className="mr-3 text-muted-foreground" /> Final Auction Order (Locked)
          </CardTitle>
          <CardDescription>
            {generatedAt ? `Generated on ${format(generatedAt, "PPP 'at' p")}` : 'Timestamp not available.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Player List</h3>
              <Button onClick={handleFullScreen} disabled={players.length === 0}>
                <Expand className="mr-2 h-4 w-4" /> Full Screen Mode
              </Button>
          </div>
          <ol className="space-y-3 list-decimal list-inside bg-secondary p-4 rounded-lg">
            {players.map((player) => (
              <li key={player.id} className="text-lg font-medium p-2 rounded-md bg-background shadow-sm">
                <span className="ml-2">{player.playerName}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
