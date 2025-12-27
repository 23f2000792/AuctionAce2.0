
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, writeBatch, doc, getDocs, query, where } from 'firebase/firestore';
import { Player } from '@/lib/player-data';
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

  const playersQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'players'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: existingPlayers, isLoading: isLoadingPlayers } = useCollection<Player>(playersQuery);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !user || !firestore || isLoadingPlayers) {
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
          const importedData = results.data as any[];
          
          const batch = writeBatch(firestore);
          let playersAdded = 0;
          let playersUpdated = 0;
          
          const existingPlayersMap = new Map(existingPlayers?.map(p => [p.playerName.toLowerCase(), p]));

          for (const item of importedData) {
            const playerName = `${item['First Name'] || ''} ${item['Surname'] || ''}`.trim();
            if (!playerName) continue;

            const newPlayerData: Omit<Player, 'id'> = {
              playerName: playerName,
              firstName: item['First Name'] || '',
              surname: item['Surname'] || '',
              country: item['Country'] || '',
              specialism: item['Specialism'] || '',
              cua: item['C/U/A'] || '',
              reservePrice: parseFloat(item['Reserve Price Rs Lakh']) || 0,
              points: parseInt(item['Points'], 10) || 0,
              playerNumber: parseInt(item['List Sr.No.'], 10) || 0,
              userId: user.uid,
            };

            const existingPlayer = existingPlayersMap.get(playerName.toLowerCase());

            if (existingPlayer) {
              // Player exists, update it
              const playerRef = doc(firestore, 'players', existingPlayer.id);
              batch.update(playerRef, newPlayerData);
              playersUpdated++;
            } else {
              // New player, add it
              const playerRef = doc(playersCollectionRef); // Auto-generate ID
              batch.set(playerRef, newPlayerData);
              playersAdded++;
            }
          }
          
          await batch.commit();

          toast({
            title: 'Import Successful',
            description: `${playersAdded} players added and ${playersUpdated} players updated.`,
            action: (
               <CheckCircle className="text-green-500" />
            )
          });

          router.push('/players');

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
          <CardTitle className="flex items-center"><Upload className="mr-2" /> Import Players from CSV</CardTitle>
          <CardDescription>
            Add new players or update existing ones from a CSV file. This will not delete your existing players.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                 <p className="text-sm font-medium">The CSV should have the following columns:</p>
                 <code className="text-xs p-2 bg-muted rounded-sm block whitespace-pre-wrap">List Sr.No., First Name, Surname, Country, Specialism, C/U/A, Reserve Price Rs Lakh, Points</code>
                 <p className="text-sm text-muted-foreground pt-2">Players are matched by their full name. If a player from the CSV already exists in your list, their information will be updated. Otherwise, a new player will be created.</p>
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
            disabled={!file || isProcessing || isLoadingPlayers}
            className="w-full"
          >
            {isProcessing || isLoadingPlayers ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLoadingPlayers ? 'Loading players...' : 'Processing...'}
              </>
            ) : (
              <>
                <Upload className="mr-2" />
                Import Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
