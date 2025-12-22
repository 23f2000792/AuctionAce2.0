
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Layers, PlusCircle, Users, LogIn, Edit, Gavel, Upload } from 'lucide-react';
import { PlayerSet } from '@/lib/player-data';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const setsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'sets'), where('userId', '==', user.uid));
  }, [user, firestore]);

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
                    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
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
                              <Gavel className="mr-2" /> Start Auction
                            </Link>
                          </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-16 border-2 border-dashed border-primary/20 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
