
'use client';

import { useState } from 'react';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, writeBatch, doc, getDocs, query, where } from 'firebase/firestore';
import { Player, PlayerSet } from '@/lib/player-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !user || !firestore) {
      toast({
        title: 'Error',
        description: 'File, user, or database not ready.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const playersCollectionRef = collection(firestore, 'players');
          const setsCollectionRef = collection(firestore, 'sets');
          
          const importedPlayers = results.data as any[];

          // First, create all players and get their IDs
          const batch = writeBatch(firestore);
          const playersWithIds: Player[] = [];
          
          for (const item of importedPlayers) {
            const playerName = `${item['First Name'] || ''} ${item['Surname'] || ''}`.trim();
            if (!playerName) continue;

            const newPlayer: Omit<Player, 'id'> = {
              playerName: playerName,
              firstName: item['First Name'] || '',
              surname: item['Surname'] || '',
              country: item['Country'] || '',
              specialism: item['Specialism'] || '',
              cua: item['C/U/A'] || '',
              reservePrice: parseFloat(item['Reserve Price Rs Lakh']) || 0,
              points: parseInt(item['Points'], 10) || 0,
              playerNumber: Math.floor(Math.random() * 1000), // Assign a random number as it's not in CSV
              userId: user.uid,
            };

            const playerRef = doc(playersCollectionRef); // Auto-generate ID
            batch.set(playerRef, newPlayer);
            playersWithIds.push({ ...newPlayer, id: playerRef.id });
          }

          // Commit the player creation batch
          await batch.commit();

          // Group players by Set
          const setsMap = new Map<string, Player[]>();
          importedPlayers.forEach((item, index) => {
            const setName = item['Set'];
            if (setName) {
              if (!setsMap.has(setName)) {
                setsMap.set(setName, []);
              }
              // Find the corresponding player that was just created
              const createdPlayer = playersWithIds.find(p => p.playerName === `${item['First Name'] || ''} ${item['Surname'] || ''}`.trim());
              if(createdPlayer) {
                 setsMap.get(setName)?.push(createdPlayer);
              }
            }
          });

          // Delete old sets for this user
          const oldSetsQuery = query(setsCollectionRef, where('userId', '==', user.uid));
          const oldSetsSnapshot = await getDocs(oldSetsQuery);
          const deleteBatch = writeBatch(firestore);
          oldSetsSnapshot.forEach(doc => deleteBatch.delete(doc.ref));
          await deleteBatch.commit();
          

          // Create new sets
          const setCreationBatch = writeBatch(firestore);
          for (const [setName, playersInSet] of setsMap.entries()) {
            const newSet: Omit<PlayerSet, 'id'> = {
              name: setName,
              players: playersInSet,
              userId: user.uid,
            };
            const setRef = doc(setsCollectionRef);
            setCreationBatch.set(setRef, newSet);
          }
          
          await setCreationBatch.commit();

          toast({
            title: 'Import Successful',
            description: `${importedPlayers.length} players and ${setsMap.size} sets have been imported.`,
            action: (
               <CheckCircle className="text-green-500" />
            )
          });

          router.push('/');

        } catch (error: any) {
          console.error('Import error:', error);
          toast({
            title: 'Import Failed',
            description: error.message || 'An unknown error occurred.',
            variant: 'destructive',
             action: (
               <AlertTriangle className="text-red-500" />
            )
          });
        } finally {
          setIsProcessing(false);
        }
      },
      error: (error: any) => {
        console.error('CSV parsing error:', error);
        toast({
          title: 'CSV Parsing Failed',
          description: error.message,
          variant: 'destructive',
        });
        setIsProcessing(false);
      },
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Upload className="mr-2" /> Import from CSV</CardTitle>
          <CardDescription>
            Upload a CSV file to automatically populate your players and sets. The old sets and players will be replaced.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                 <p className="text-sm font-medium">The CSV should have the following columns:</p>
                 <code className="text-xs p-2 bg-muted rounded-sm block">Set, First Name, Surname, Country, Specialism, C/U/A, Reserve Price Rs Lakh, Points</code>
            </div>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isProcessing}
            className="file:text-primary file:font-bold"
          />
          <Button
            onClick={handleImport}
            disabled={!file || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Import Data'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
