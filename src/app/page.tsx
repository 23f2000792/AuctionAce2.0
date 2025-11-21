"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Layers, PlusCircle, Users } from 'lucide-react';
import Image from 'next/image';
import { PlayerSet } from '@/lib/player-data';

export default function Home() {
  const [sets, setSets] = useState<PlayerSet[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedSets = localStorage.getItem('playerSets');
    if (storedSets) {
      setSets(JSON.parse(storedSets));
    }
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex justify-end gap-2 mb-4">
        <Button asChild variant="outline">
          <Link href="/players">
            <Users className="mr-2" /> Manage Players
          </Link>
        </Button>
        <Button asChild>
          <Link href="/sets/create">
            <PlusCircle className="mr-2" /> Create New Set
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Select a Player Set</CardTitle>
          <CardDescription>
            Choose a set of players to begin the auction. Create your own sets and manage players.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sets.map((set) => (
                <Card key={set.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Layers className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{set.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow">
                    <div className="flex -space-x-2 overflow-hidden">
                      {set.players.slice(0, 5).map((player) => (
                        <Image
                          key={player.id}
                          src={player.imageUrl}
                          alt={player.name}
                          width={32}
                          height={32}
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-background"
                          data-ai-hint="player photo"
                        />
                      ))}
                      {set.players.length > 5 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground ring-2 ring-background">
                          +{set.players.length - 5}
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{set.players.length} players</p>
                  </CardContent>
                  <CardFooter className="p-4">
                     <Button asChild className="w-full mt-auto">
                        <Link href={`/auction/${set.id}`}>
                          Start Auction <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Sets Created Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by adding some players and creating your first set.</p>
                <div className="mt-6">
                    <Button asChild>
                        <Link href="/sets/create">
                            <PlusCircle className="mr-2" /> Create a Set
                        </Link>
                    </Button>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
