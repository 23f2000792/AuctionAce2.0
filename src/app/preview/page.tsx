"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { shuffleArray } from "@/lib/utils";
import PinModal from "@/components/PinModal";
import { RefreshCw, Lock } from 'lucide-react';

export default function PreviewPage() {
  const { players, shuffledPlayers, setShuffledPlayers } = useContext(AppContext);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // If there are no players, redirect to the home page.
    if (players.length === 0) {
      router.replace("/");
    }
  }, [players, router]);

  const regenerateOrder = () => {
    const reshuffled = shuffleArray(players);
    setShuffledPlayers(reshuffled);
  };
  
  if (players.length === 0) {
    return null; // Render nothing while redirecting
  }

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Generated Auction Order</CardTitle>
            <CardDescription>Review the random order. You can regenerate it or lock it in.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside bg-secondary p-4 rounded-lg">
              {shuffledPlayers.map((player, index) => (
                <li key={`${player}-${index}`} className="text-lg font-medium p-2 rounded-md bg-background shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="ml-2">{player}</span>
                </li>
              ))}
            </ol>
          </CardContent>
          <CardFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={regenerateOrder} className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" /> Regenerate Order
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto sm:ml-auto bg-accent hover:bg-accent/90">
              <Lock className="mr-2 h-4 w-4" /> Freeze Final Order
            </Button>
          </CardFooter>
        </Card>
      </div>
      <PinModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </>
  );
}
