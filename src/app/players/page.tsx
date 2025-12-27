
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
import { Trash2, UserPlus, Users, Edit, X } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUser, useFirestore, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const playerSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  surname: z.string().optional(),
  playerNumber: z.coerce.number().min(0, 'Player number must be a positive number.'),
  country: z.string().optional(),
  specialism: z.string().optional(),
  cua: z.string().optional(),
  reservePrice: z.coerce.number().min(0).optional(),
  points: z.coerce.number().min(0).optional(),
});

type PlayerFormData = z.infer<typeof playerSchema>;

export default function PlayersPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);


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
      firstName: '',
      surname: '',
      playerNumber: 0,
      country: '',
      specialism: '',
      cua: '',
      reservePrice: 0,
      points: 0,
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (editingPlayer) {
      form.reset({
        firstName: editingPlayer.firstName,
        surname: editingPlayer.surname,
        playerNumber: editingPlayer.playerNumber,
        country: editingPlayer.country,
        specialism: editingPlayer.specialism,
        cua: editingPlayer.cua,
        reservePrice: editingPlayer.reservePrice,
        points: editingPlayer.points,
      });
    } else {
        form.reset({
            firstName: '',
            surname: '',
            playerNumber: 0,
            country: '',
            specialism: '',
            cua: '',
            reservePrice: 0,
            points: 0,
        });
    }
  }, [editingPlayer, form]);


  const onSubmit: SubmitHandler<PlayerFormData> = (data) => {
    if (!user || !playersCollection) return;

    const fullPlayerName = `${data.firstName || ''} ${data.surname || ''}`.trim();

    const playerData = {
      ...data,
      playerName: fullPlayerName,
      userId: user.uid,
    }

    if (editingPlayer) {
        // Update existing player
        const playerRef = doc(firestore, 'players', editingPlayer.id);
        updateDocumentNonBlocking(playerRef, playerData);
        toast({
            title: 'Player Updated',
            description: `${playerData.playerName} has been updated.`,
        });
        setEditingPlayer(null);

    } else {
        // Add new player
        addDocumentNonBlocking(playersCollection, playerData);
        toast({
            title: 'Player Added',
            description: `${playerData.playerName} has been added to your list.`,
        });
    }
    
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
  
  const handleEditClick = (player: Player) => {
    setEditingPlayer(player);
     window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const cancelEdit = () => {
    setEditingPlayer(null);
  }

  if (isUserLoading || !user) {
    return <div className="w-full text-center">Loading...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="mr-2" /> {editingPlayer ? `Editing ${editingPlayer.playerName}` : 'Add New Player'}
              </CardTitle>
              <CardDescription>
                {editingPlayer ? 'Update the player details below.' : 'Add a new player to your master list. They will be available to add to auction sets.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surname</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Doe" {...field} />
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
                <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., India" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                control={form.control}
                name="specialism"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialism</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Batter" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                control={form.control}
                name="cua"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status (C/U/A)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Capped" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                control={form.control}
                name="reservePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reserve Price (Lakh)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 20" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 100" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {editingPlayer && (
                 <Button type="button" variant="outline" onClick={cancelEdit}>
                    <X className="mr-2" />
                    Cancel
                 </Button>
              )}
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {editingPlayer ? 'Update Player' : 'Add Player'}
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
                    <div key={i} className="flex items-center justify-between p-4 rounded-md bg-muted/50 animate-pulse h-12"/>
                ))}
            </div>
          )}
          {!isLoadingPlayers && players && players.length > 0 ? (
            <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Specialism</TableHead>
                    <TableHead>Price (Lakh)</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {players.map((player) => (
                    <TableRow key={player.id}>
                        <TableCell className="font-mono text-muted-foreground w-8 text-center">{player.playerNumber}</TableCell>
                        <TableCell className="font-medium">{player.playerName}</TableCell>
                        <TableCell>{player.country}</TableCell>
                        <TableCell>{player.specialism}</TableCell>
                        <TableCell>{player.reservePrice}</TableCell>
                        <TableCell>{player.points}</TableCell>
                        <TableCell className="text-right">
                             <div className="flex items-center justify-end gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditClick(player)}
                                    className="text-muted-foreground hover:text-primary"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deletePlayer(player.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </div>
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

    