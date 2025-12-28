
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Layers, PlusCircle, Users, LogIn, Edit, Gavel, Upload, Lock, View } from 'lucide-react';
import { PlayerSet } from '@/lib/player-data';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const setsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // Query for sets belonging to the current user, sorted by 'order'
    return query(
      collection(firestore, 'sets'),
      where('userId', '==', user.uid),
      orderBy('order')
    );
  }, [firestore, user]);

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

  const isLoading = isUserLoading || isLoadingSets;

  if (isLoading && !sets) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        {user && (
          <div className="flex justify-end gap-2 mb-4">
            <div className="h-10 w-40 animate-pulse rounded-md bg-muted/50" />
            <div className="h-10 w-40 animate-pulse rounded-md bg-muted/50" />
          </div>
        )}
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

  return (
    <motion.div 
      className="w-full max-w-5xl mx-auto"
      initial="hidden"
      animate="visible"
    >
      <Card className="glow-border bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl">Select a Player Set</CardTitle>
          <CardDescription>
            {user ? "Choose one of your created sets to begin an auction." : "Log in to manage your auction sets."}
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
                  <h3 className="mt-4 text-lg font-medium">{user ? "No Sets Found" : "Welcome to Auction Ace"}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{user ? "Get started by importing players from a CSV." : "Log in to create and manage your player auctions."}</p>
                  
                  {!user && !isUserLoading && (
                    <div className="mt-6">
                      <Button asChild className="btn-glow">
                          <Link href="/login">
                              <Lock className="mr-2" /> Admin Login
                          </Link>
                      </Button>
                    </div>
                  )}
                   {user && !isLoadingSets && (
                    <div className="mt-6">
                      <Button asChild>
                          <Link href="/import">
                              <Upload className="mr-2" /> Import CSV
                          </Link>
                      </Button>
                    </div>
                  )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
