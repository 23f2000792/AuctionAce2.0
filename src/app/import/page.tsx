
'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
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
          const batch = writeBatch(firestore);
          
          // 1. Delete all existing players for the user
          const playersCollectionRef = collection(firestore, 'players');
          const playersQuery = query(playersCollectionRef, where('userId', '==', user.uid));
          const existingPlayersSnap = await getDocs(playersQuery);
          existingPlayersSnap.forEach(doc => batch.delete(doc.ref));

          // 2. Delete all existing sets for the user
          const setsCollectionRef = collection(firestore, 'sets');
          const setsQuery = query(setsCollectionRef, where('userId', '==', user.uid));
          const existingSetsSnap = await getDocs(setsQuery);
          existingSetsSnap.forEach(doc => batch.delete(doc.ref));

          const importedData = results.data as any[];
          const newPlayers: Player[] = [];
          
          // 3. Add new players from CSV
          for (const item of importedData) {
            const playerName = `${item['First Name'] || ''} ${item['Surname'] || ''}`.trim();
            if (!playerName) continue;

            const playerRef = doc(playersCollectionRef); // Create a new document reference
            const newPlayerData: Player = {
              id: playerRef.id,
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
            
            batch.set(playerRef, newPlayerData);
            newPlayers.push(newPlayerData);
          }

          // 4. Create a single new set with all players from the CSV
          if (newPlayers.length > 0) {
            const setRef = doc(setsCollectionRef);
            const setName = file.name.replace(/\.csv$/i, ''); // Use filename as set name
            batch.set(setRef, {
              name: setName,
              players: newPlayers,
              userId: user.uid,
            });
          }
          
          await batch.commit();

          toast({
            title: 'Import Successful',
            description: `All existing data cleared. Imported ${newPlayers.length} players and created 1 new set.`,
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
          <CardTitle className="flex items-center"><Upload className="mr-2" /> Import Players from CSV</CardTitle>
          <CardDescription>
            <span className="font-bold text-destructive">Warning:</span> This will permanently delete all your existing players and sets and replace them with the content from the CSV file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                 <p className="text-sm font-medium">The CSV should have the following columns:</p>
                 <code className="text-xs p-2 bg-muted rounded-sm block whitespace-pre-wrap">List Sr.No., First Name, Surname, Country, Specialism, C/U/A, Reserve Price Rs Lakh, Points</code>
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
              <>
                <Upload className="mr-2" />
                Import and Overwrite Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
