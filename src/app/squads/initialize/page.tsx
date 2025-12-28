
'use client';

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, writeBatch } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const initialHouses = [
    { name: 'Sundarbans', moneySpent: 0, moneyLeft: 80, budgetUsed: 0, budgetStatus: 'OK', eligibilityStatus: 'IN PROGRESS', totalPoints: 'N/A' },
    { name: 'Kanha', moneySpent: 0, moneyLeft: 80, budgetUsed: 0, budgetStatus: 'OK', eligibilityStatus: 'IN PROGRESS', totalPoints: 'N/A' },
    { name: 'Wayanad', moneySpent: 0, moneyLeft: 80, budgetUsed: 0, budgetStatus: 'OK', eligibilityStatus: 'IN PROGRESS', totalPoints: 'N/A' },
    { name: 'Kaziranga', moneySpent: 0, moneyLeft: 80, budgetUsed: 0, budgetStatus: 'OK', eligibilityStatus: 'IN PROGRESS', totalPoints: 'N/A' },
    { name: 'Corbett', moneySpent: 0, moneyLeft: 80, budgetUsed: 0, budgetStatus: 'OK', eligibilityStatus: 'IN PROGRESS', totalPoints: 'N/A' },
    { name: 'Bandipur', moneySpent: 0, moneyLeft: 80, budgetUsed: 0, budgetStatus: 'OK', eligibilityStatus: 'IN PROGRESS', totalPoints: 'N/A' },
    { name: 'Nilgiri', moneySpent: 0, moneyLeft: 80, budgetUsed: 0, budgetStatus: 'OK', eligibilityStatus: 'IN PROGRESS', totalPoints: 'N/A' },
    { name: 'Gir', moneySpent: 0, moneyLeft: 80, budgetUsed: 0, budgetStatus: 'OK', eligibilityStatus: 'IN PROGRESS', totalPoints: 'N/A' },
    { name: 'Nallamala', moneySpent: 0, moneyLeft: 80, budgetUsed: 0, budgetStatus: 'OK', eligibilityStatus: 'IN PROGRESS', totalPoints: 'N/A' },
    { name: 'Saranda', moneySpent: 0, moneyLeft: 80, budgetUsed: 0, budgetStatus: 'OK', eligibilityStatus: 'IN PROGRESS', totalPoints: 'N/A' },
    { name: 'Pichavaram', moneySpent: 0, moneyLeft: 80, budgetUsed: 0, budgetStatus: 'OK', eligibilityStatus: 'IN PROGRESS', totalPoints: 'N/A' },
    { name: 'Namdapha', moneySpent: 0, moneyLeft: 80, budgetUsed: 0, budgetStatus: 'OK', eligibilityStatus: 'IN PROGRESS', totalPoints: 'N/A' },
];

export default function InitializeSquadsPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [isInitializing, setIsInitializing] = useState(false);

    const handleInitialize = async () => {
        if (!firestore || !user) {
            toast({
                title: "Authentication Error",
                description: "You must be logged in to perform this action.",
                variant: "destructive"
            });
            return;
        }

        setIsInitializing(true);
        try {
            const squadsCollection = collection(firestore, 'squads');
            const batch = writeBatch(firestore);

            initialHouses.forEach(house => {
                const docRef = collection(firestore, 'squads').doc();
                batch.set(docRef, house);
            });

            await batch.commit();

            toast({
                title: "Initialization Successful",
                description: "The squads collection has been populated in Firestore.",
                action: <CheckCircle className="text-green-500" />
            });

            router.push('/squads');

        } catch (error: any) {
            console.error("Failed to initialize squads:", error);
            toast({
                title: "Initialization Failed",
                description: error.message || "An unknown error occurred.",
                variant: "destructive",
                action: <AlertTriangle className="text-red-500" />
            });
        } finally {
            setIsInitializing(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Initialize Squad Data</CardTitle>
                    <CardDescription>
                        This is a one-time setup step. Clicking this button will create the initial 12 house documents in your Firestore 'squads' collection. If documents already exist, this will add new ones, so only run this if the collection is empty.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={handleInitialize}
                        disabled={isInitializing}
                        className="w-full"
                    >
                        {isInitializing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Initializing...
                            </>
                        ) : (
                            "Create Initial Squads in Firestore"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
