
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, CheckCircle, AlertTriangle, Clock, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { DocumentData } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Squad extends DocumentData {
    name: string;
    moneySpent: number;
    moneyLeft: number;
    budgetUsed: number;
    budgetStatus: 'OK' | 'OVER';
    eligibilityStatus: string;
    totalPoints: number | 'N/A';
}

export default function SquadsPage() {
    const firestore = useFirestore();
    const squadsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'squads'), orderBy('name'));
    }, [firestore]);

    const { data: squads, isLoading } = useCollection<Squad>(squadsQuery);

    return (
        <motion.div
            className="w-full max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="glow-border bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center text-3xl">
                        <ShieldCheck className="mr-3 h-8 w-8 text-primary" />
                        Live Squad &amp; Points Status
                    </CardTitle>
                    <CardDescription>
                        This dashboard shows the live status of each house's squad, purse, and points from Firestore.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="space-y-2">
                           {[...Array(12)].map(i => <div key={i} className="h-14 w-full animate-pulse rounded-md bg-muted/50" />)}
                        </div>
                    )}
                    { !isLoading && squads && squads.length > 0 && (
                        <div className="border rounded-lg overflow-hidden glow-border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-primary/10 hover:bg-primary/20">
                                        <TableHead className="text-primary">House Name</TableHead>
                                        <TableHead className="text-right text-primary">Money Spent</TableHead>
                                        <TableHead className="text-right text-primary">Money Left</TableHead>
                                        <TableHead className="text-center text-primary">Budget Used</TableHead>
                                        <TableHead className="text-center text-primary">Budget Status</TableHead>
                                        <TableHead className="text-center text-primary">Eligibility Status</TableHead>
                                        <TableHead className="text-center text-primary">Total Points</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {squads.map((squad) => (
                                        <TableRow key={squad.id} className="bg-card/50">
                                            <TableCell className="font-medium text-lg">{squad.name}</TableCell>
                                            <TableCell className="text-right font-mono">{squad.moneySpent} Cr</TableCell>
                                            <TableCell className="text-right font-mono text-accent font-bold">{squad.moneyLeft} Cr</TableCell>
                                            <TableCell className="text-center font-mono">{squad.budgetUsed}%</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={squad.budgetStatus === 'OK' ? 'secondary' : 'destructive'} className="gap-1 items-center">
                                                    {squad.budgetStatus === 'OK' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                                    {squad.budgetStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="gap-1 items-center">
                                                    <Clock className="h-3 w-3" />
                                                    {squad.eligibilityStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-mono font-bold text-lg">{squad.totalPoints}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                     { !isLoading && (!squads || squads.length === 0) && (
                        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
                            <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No Squad Data Found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">The 'squads' collection in Firestore is empty. You need to initialize it first.</p>
                            <div className="mt-6">
                                <Button asChild>
                                    <Link href="/squads/initialize">
                                        Initialize Squad Data
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
