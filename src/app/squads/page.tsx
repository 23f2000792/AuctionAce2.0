
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const houseData = [
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

export default function SquadsPage() {
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
                        Live Squad Status
                    </CardTitle>
                    <CardDescription>
                        This dashboard shows the live status of each house's squad, purse, and points.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                {houseData.map((house) => (
                                    <TableRow key={house.name} className="bg-card/50">
                                        <TableCell className="font-medium text-lg">{house.name}</TableCell>
                                        <TableCell className="text-right font-mono">{house.moneySpent} Cr</TableCell>
                                        <TableCell className="text-right font-mono text-accent font-bold">{house.moneyLeft} Cr</TableCell>
                                        <TableCell className="text-center font-mono">{house.budgetUsed}%</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={house.budgetStatus === 'OK' ? 'secondary' : 'destructive'} className="gap-1 items-center">
                                                {house.budgetStatus === 'OK' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                                {house.budgetStatus}
                                            </Badge>
                                        </TableCell>
                                         <TableCell className="text-center">
                                            <Badge variant="outline" className="gap-1 items-center">
                                                <Clock className="h-3 w-3" />
                                                {house.eligibilityStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-mono font-bold text-lg">{house.totalPoints}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
