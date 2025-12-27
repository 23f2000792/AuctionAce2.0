
'use client';

import { useParams, useRouter } from 'next/navigation';
import { PlayerSet } from '@/lib/player-data';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';

export default function RosterPage() {
  const params = useParams();
  const slug = params.slug as string;

  const firestore = useFirestore();

  const setRef = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    return doc(firestore, 'sets', slug) as DocumentReference<PlayerSet>;
  }, [firestore, slug]);

  const { data: set, isLoading: isLoadingSet } = useDoc<PlayerSet>(setRef);

  if (isLoadingSet) {
    return <div className="text-center">Loading Roster...</div>;
  }

  if (!set) {
    return <div className="text-center">Set not found.</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Button variant="outline" asChild>
        <Link href="/"><ArrowLeft className="mr-2" /> Back to All Sets</Link>
      </Button>

      <Card className="glow-border">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-3">
             <Users />
             <span>Auction Roster for "{set.name}"</span>
          </CardTitle>
          <CardDescription>
            This is the official, fixed auction order for this set. There are {set.players.length} players total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-y-auto pr-4 border rounded-lg p-2 bg-background/50">
            <ol className="space-y-2">
              {set.players.map((player, index) => (
                <li key={player.id} className="flex items-center gap-4 p-3 bg-secondary rounded-md">
                  <span className="font-bold text-primary text-xl w-8 text-center">{index + 1}.</span>
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    <p className="font-medium text-lg col-span-2 md:col-span-1">{player.playerName}</p>
                    <p className="text-sm text-muted-foreground">
                        <span className="font-bold text-foreground">Country:</span> {player.country || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        <span className="font-bold text-foreground">Specialism:</span> {player.specialism || 'N/A'}
                    </p>
                     <p className="text-sm text-muted-foreground">
                        <span className="font-bold text-foreground">Price:</span> {player.reservePrice ? `${player.reservePrice} Lakh` : 'N/A'}
                    </p>
                  </div>
                   <span className="font-mono text-xs text-primary ml-auto hidden md:inline">
                        #{player.playerNumber}
                   </span>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
