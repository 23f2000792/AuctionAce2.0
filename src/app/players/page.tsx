'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { useToast } from '@/hooks/use-toast';
import { Player } from '@/lib/player-data';
import { Trash2, UserPlus, Users } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUser, useFirestore, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const playerSchema = z.object({
  playerName: z.string().min(1, 'Player name is required.'),
  playerNumber: z.coerce.number().min(0, 'Player number must be a positive number.'),
});

type PlayerFormData = z.infer<typeof playerSchema>;

export default function PlayersPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const playersCollection = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'players');
  }, [firestore]);

  const playersQuery = useMemoFirebase(() => {
    if (!user || !playersCollection) return null;
    return query(playersCollection, where('userId', '==', user.uid));
  }, [user, playersCollection]);

  const { data: players, isLoading: isLoadingPlayers } = useCollection<Player>(playersQuery);

  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      playerName: '',
      playerNumber: 0,
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);


  const onSubmit: SubmitHandler<PlayerFormData> = (data) => {
    if (!user || !playersCollection) return;

    const newPlayer = {
      ...data,
      userId: user.uid,
    };
    
    addDocumentNonBlocking(playersCollection, newPlayer);

    toast({
      title: 'Player Added',
      description: `${data.playerName} has been added to your list.`,
    });
    form.reset();
  };

  const deletePlayer = (id: string) => {
    if (!firestore) return;
    const playerToDelete = players?.find(p => p.id === id);
    const docRef = doc(firestore, 'players', id);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: 'Player Removed',
      description: `${playerToDelete?.playerName} has been removed.`,
      variant: 'destructive',
    });
  };

  if (isUserLoading || !user) {
    return <div className="w-full text-center">Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="mr-2" /> Add New Player
              </CardTitle>
              <CardDescription>
                Add a new player to your master list. They will be available to add to auction sets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="playerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="playerNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player Number</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 7" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="ml-auto">
                Add Player
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Player List</CardTitle>
          <CardDescription>
            Here are all the players you've added.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPlayers && (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-md bg-secondary animate-pulse">
                        <div className="h-5 w-48 bg-muted rounded-md" />
                        <div className="h-8 w-8 bg-muted rounded-md" />
                    </div>
                ))}
            </div>
          )}
          {!isLoadingPlayers && players && players.length > 0 ? (
            <ul className="space-y-3">
              {players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between p-2 rounded-md bg-secondary"
                >
                  <div className="flex items-center gap-3">
                     <span className="font-mono text-muted-foreground w-8 text-center">#{player.playerNumber}</span>
                    <span className="font-medium">{player.playerName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePlayer(player.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            !isLoadingPlayers && (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Players Yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Add players using the form above to get started.</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
