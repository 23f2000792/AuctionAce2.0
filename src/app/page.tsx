"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Layers } from 'lucide-react';
import { sets } from '@/lib/player-data';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Select a Player Set</CardTitle>
          <CardDescription>
            Choose a set of players to begin the auction. Players are organized into sets to manage the auction in phases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sets.map((set) => (
              <Card key={set.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4">
                   <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                          <Layers className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">Set {set.id}</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
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
                  <Button asChild className="w-full mt-4">
                    <Link href={`/auction/${set.id}`}>
                      Start Auction <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
