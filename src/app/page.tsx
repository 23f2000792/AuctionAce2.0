
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Layers, PlusCircle, Users, LogIn, Edit, Gavel, Upload, Lock, View } from 'lucide-react';
import { PlayerSet } from '@/lib/player-data';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const setsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Order by the 'order' field first, then by name for consistent sorting
    return query(collection(firestore, 'sets'), orderBy('order', 'asc'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: sets, isLoading: isLoadingSets } = useCollection<PlayerSet>(setsQuery);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  if (isUserLoading || isLoadingSets) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex justify-end gap-2 mb-4">
           <div className="h-10 w-40 animate-pulse rounded-md bg-muted/50" />
           <div className="h-10 w-40 animate-pulse rounded-md bg-muted/50" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-8 w-64 animate-pulse rounded-md bg-muted/50" />
            <div className="h-4 w-96 animate-pulse rounded-md bg-muted/50 mt-2" />
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-lg bg-muted/50" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
     return (
       <motion.div 
          className="w-full max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
        <Card className="glow-border bg-card/70 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-3xl">Welcome to Auction Ace!</CardTitle>
                <CardDescription>Your ultimate tool for creating and managing IPL-style player auctions.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="mb-6">Please log in to create your player sets and start your auction.</p>
                <Button asChild size="lg" className="btn-glow">
                    <Link href="/login"><LogIn className="mr-2"/>Log In to Get Started</Link>
                </Button>
            </CardContent>
        </Card>
       </motion.div>
     )
  }

  return (
    <motion.div 
      className="w-full max-w-5xl mx-auto"
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-end gap-2 mb-4">
        <Button asChild variant="outline">
            <Link href="/import">
                <Upload className="mr-2" /> Import CSV
            </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/players">
            <Users className="mr-2" /> Manage Players
          </Link>
        </Button>
        <Button asChild className="btn-glow">
          <Link href="/sets/create">
            <PlusCircle className="mr-2" /> Create New Set
          </Link>
        </Button>
      </div>

      <Card className="glow-border bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl">Select a Player Set</CardTitle>
          <CardDescription>
            Choose a set of players to begin the auction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {sets && sets.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {sets.map((set) => (
                  <motion.div
                    key={set.id}
                    variants={cardVariants}
                  >
                    <Card className="hover:border-primary/50 transition-all flex flex-col h-full bg-gradient-to-br from-card/80 to-card/50 hover:from-card/90 glow-border hover:-translate-y-1">
                      <CardHeader className="p-4 flex-row items-start justify-between">
                         <CardTitle className="text-lg truncate">{set.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex-grow">
                         <div className="flex flex-col items-start text-sm text-muted-foreground">
                            <span className="text-xs uppercase font-bold tracking-wider text-accent">Players</span>
                            <span className="text-4xl font-mono font-bold text-foreground">{set.players.length}</span>
                         </div>
                      </CardContent>
                      <CardFooter className="p-4 mt-auto flex flex-col gap-2">
                         <Button asChild className="w-full btn-glow">
                            <Link href={`/auction/present/${set.id}`}>
                              Start Auction
                            </Link>
                          </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-16 border-2 border-dashed border-border rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                  <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Sets Created Yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Get started by adding some players and creating your first set.</p>
                  <div className="mt-6">
                      <Button asChild className="btn-glow">
                          <Link href="/sets/create">
                              <PlusCircle className="mr-2" /> Create a Set
                          </Link>
                      </Button>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
