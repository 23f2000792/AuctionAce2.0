
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Player, PlayerSet } from '@/lib/player-data';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Users, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function CreateSetPage() {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [setName, setSetName] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const playersQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'players'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: allPlayers, isLoading: isLoadingPlayers } = useCollection<Player>(playersQuery);

  const setsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'sets');
  }, [firestore]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handlePlayerToggle = (player: Player) => {
    setSelectedPlayers((prev) =>
      prev.find((p) => p.id === player.id)
        ? prev.filter((p) => p.id !== player.id)
        : [...prev, player]
    );
  };

  const handleCreateSet = () => {
    if (!setName.trim()) {
      toast({ title: 'Set name is required.', variant: 'destructive' });
      return;
    }
    if (selectedPlayers.length === 0) {
      toast({ title: 'Select at least one player.', variant: 'destructive' });
      return;
    }
    if (!user || !setsCollection) return;

    const newSet = {
      name: setName,
      players: selectedPlayers,
      userId: user.uid,
    };

    addDocumentNonBlocking(setsCollection, newSet);

    toast({
      title: 'Set Created!',
      description: `"${setName}" has been created with ${selectedPlayers.length} players.`,
    });

    router.push('/');
  };

  if (isUserLoading || !user) {
    return <div className="w-full text-center">Loading...</div>
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
       <Button variant="outline" asChild className="mb-4">
          <Link href="/"><ArrowLeft className="mr-2" /> Back to Sets</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create a New Player Set</CardTitle>
          <CardDescription>
            Give your set a name and choose the players to include in this auction round.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="set-name">Set Name</Label>
            <Input
              id="set-name"
              placeholder="e.g., Marquee Players, Set A, Round 1"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Players</Label>
            {isLoadingPlayers && (
                <Card>
                    <CardContent className="p-4">
                        <div className="h-40 animate-pulse rounded-md bg-muted" />
                    </CardContent>
                </Card>
            )}
            {!isLoadingPlayers && allPlayers && allPlayers.length > 0 ? (
                <Card>
                    <CardContent className="p-4 max-h-[400px] overflow-y-auto">
                        <ul className="space-y-3">
                        {allPlayers.map((player) => (
                            <li
                            key={player.id}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer"
                            onClick={() => handlePlayerToggle(player)}
                            >
                            <Checkbox
                                checked={selectedPlayers.some((p) => p.id === player.id)}
                                onCheckedChange={() => handlePlayerToggle(player)}
                                id={`player-${player.id}`}
                            />
                            <span className="font-mono text-muted-foreground w-8 text-center">#{player.playerNumber}</span>
                            <label htmlFor={`player-${player.id}`} className="font-medium cursor-pointer">{player.playerName}</label>
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                </Card>
            ) : (
                !isLoadingPlayers && (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No Players Found</h3>
                      <p className="mt-1 text-sm text-muted-foreground">You need to add players before you can create a set.</p>
                      <div className="mt-6">
                          <Button asChild>
                              <Link href="/players">
                                  <PlusCircle className="mr-2" /> Add Players
                              </Link>
                          </Button>
                      </div>
                  </div>
                )
            )}
          </div>
           <p className="text-sm text-muted-foreground font-medium">
              {selectedPlayers.length} player(s) selected.
            </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateSet} className="ml-auto" disabled={!setsCollection}>
            Create Set
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
