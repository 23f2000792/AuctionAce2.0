
'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, writeBatch, doc, getDocs, query, where } from 'firebase/firestore';
import { Player, PlayerSet } from '@/lib/player-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
          
          // Delete old data first
          const oldSetsQuery = query(setsCollectionRef, where('userId', '==', user.uid));
          const oldPlayersQuery = query(playersCollectionRef, where('userId', '==', user.uid));
          
          const [oldSetsSnapshot, oldPlayersSnapshot] = await Promise.all([
            getDocs(oldSetsQuery),
            getDocs(oldPlayersQuery)
          ]);

          const deleteBatch = writeBatch(firestore);
          oldSetsSnapshot.forEach(doc => deleteBatch.delete(doc.ref));
          oldPlayersSnapshot.forEach(doc => deleteBatch.delete(doc.ref));
          await deleteBatch.commit();
          
          // Now import new data
          const importedPlayers = results.data as any[];
          const creationBatch = writeBatch(firestore);
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
              playerNumber: parseInt(item['List Sr.No.'], 10) || 0,
              userId: user.uid,
            };

            const playerRef = doc(playersCollectionRef); // Auto-generate ID
            creationBatch.set(playerRef, newPlayer);
            playersWithIds.push({ ...newPlayer, id: playerRef.id });
          }

          // Group players by Set
          const setsMap = new Map<string, Player[]>();
          importedPlayers.forEach((item, index) => {
            const setName = item['Set'];
            if (setName) {
              if (!setsMap.has(setName)) {
                setsMap.set(setName, []);
              }
              const createdPlayer = playersWithIds.find(p => p.playerName === `${item['First Name'] || ''} ${item['Surname'] || ''}`.trim());
              if(createdPlayer) {
                 setsMap.get(setName)?.push(createdPlayer);
              }
            }
          });

          // Create new sets
          for (const [setName, playersInSet] of setsMap.entries()) {
            const newSet: Omit<PlayerSet, 'id'> = {
              name: setName,
              players: playersInSet,
              userId: user.uid,
            };
            const setRef = doc(setsCollectionRef);
            creationBatch.set(setRef, newSet);
          }
          
          await creationBatch.commit();

          toast({
            title: 'Import Successful',
            description: `${importedPlayers.length} players and ${setsMap.size} sets have been imported after clearing old data.`,
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
            Upload a CSV file to populate your players and sets. This will replace all existing players and sets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                 <p className="text-sm font-medium">The CSV should have the following columns:</p>
                 <code className="text-xs p-2 bg-muted rounded-sm block whitespace-pre-wrap">List Sr.No., Set, First Name, Surname, Country, Specialism, C/U/A, Reserve Price Rs Lakh, Points</code>
            </div>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isProcessing}
            className="file:text-primary file:font-bold"
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
               <Button
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
                    Import Data
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center"><Trash2 className="mr-2 text-destructive"/>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all of your current players and sets and replace them with the data from the CSV file.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleImport}>Yes, replace everything</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
