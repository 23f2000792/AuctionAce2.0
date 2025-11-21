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
import Image from 'next/image';
import { ArrowLeft, Users, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function CreateSetPage() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [setName, setSetName] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedPlayers = localStorage.getItem('players');
    if (storedPlayers) {
      setAllPlayers(JSON.parse(storedPlayers));
    }
  }, []);

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

    const newSet: PlayerSet = {
      id: Date.now(),
      name: setName,
      players: selectedPlayers,
    };

    const storedSets = localStorage.getItem('playerSets');
    const sets = storedSets ? JSON.parse(storedSets) : [];
    const updatedSets = [...sets, newSet];

    localStorage.setItem('playerSets', JSON.stringify(updatedSets));

    toast({
      title: 'Set Created!',
      description: `"${setName}" has been created with ${selectedPlayers.length} players.`,
    });

    router.push('/');
  };

  if (!isClient) {
    return null; // or a loading spinner
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
            {allPlayers.length > 0 ? (
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
                            <Image
                                src={player.imageUrl}
                                alt={player.name}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full object-cover"
                                data-ai-hint="player photo"
                            />
                            <label htmlFor={`player-${player.id}`} className="font-medium cursor-pointer">{player.name}</label>
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                </Card>
            ) : (
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
            )}
          </div>
           <p className="text-sm text-muted-foreground font-medium">
              {selectedPlayers.length} player(s) selected.
            </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateSet} className="ml-auto">
            Create Set
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
