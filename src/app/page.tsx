"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Layers, PlusCircle, Users, LogIn, Edit, Lock } from 'lucide-react';
import { PlayerSet } from '@/lib/player-data';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const setsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'sets'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: sets, isLoading: isLoadingSets } = useCollection<PlayerSet>(setsQuery);

  if (isUserLoading || isLoadingSets) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex justify-end gap-2 mb-4">
           <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
           <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-96 animate-pulse rounded-md bg-muted mt-2" />
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
     return (
       <div className="w-full max-w-2xl mx-auto text-center">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-headline">Welcome to Auction Ace!</CardTitle>
                <CardDescription>Your ultimate tool for creating and managing IPL-style player auctions.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="mb-6">Please log in to create your player sets and start your auction.</p>
                <Button asChild size="lg">
                    <Link href="/login"><LogIn className="mr-2"/>Log In to Get Started</Link>
                </Button>
            </CardContent>
        </Card>
       </div>
     )
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
            Choose a set of players to begin the auction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sets && sets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sets.map((set) => (
                <Card key={set.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="bg-primary/10 text-primary p-2 rounded-lg">
                           <Layers className="h-6 w-6" />
                         </div>
                         <CardTitle className="text-lg">{set.name}</CardTitle>
                       </div>
                       <Button variant="ghost" size="icon" asChild>
                          <Link href={`/sets/edit/${set.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                       </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow">
                     <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{set.players.length} players</span>
                     </div>
                  </CardContent>
                  <CardFooter className="p-4">
                     <Button asChild className="w-full mt-auto">
                        <Link href={`/auction/present/${set.id}`}>
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
