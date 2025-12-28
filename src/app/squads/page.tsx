
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


const houses = [
    { name: 'Sundarbans', spent: 0, left: 80, budgetUsed: 0 },
    { name: 'Kanha', spent: 0, left: 80, budgetUsed: 0 },
    { name: 'Wayanad', spent: 0, left: 80, budgetUsed: 0 },
    { name: 'Kaziranga', spent: 0, left: 80, budgetUsed: 0 },
    { name: 'Corbett', spent: 0, left: 80, budgetUsed: 0 },
    { name: 'Bandipur', spent: 0, left: 80, budgetUsed: 0 },
    { name: 'Nilgiri', spent: 0, left: 80, budgetUsed: 0 },
    { name: 'Gir', spent: 0, left: 80, budgetUsed: 0 },
    { name: 'Nallamala', spent: 0, left: 80, budgetUsed: 0 },
    { name: 'Saranda', spent: 0, left: 80, budgetUsed: 0 },
    { name: 'Pichavaram', spent: 0, left: 80, budgetUsed: 0 },
    { name: 'Namdapha', spent: 0, left: 80, budgetUsed: 0 },
];

// In a real app, this would be calculated dynamically
const houseData = houses.map(h => ({
    ...h,
    budgetStatus: h.left >= 0 ? 'OK' : 'OVER',
    eligibilityStatus: 'IN PROGRESS', // This would depend on squad size rules
    totalPoints: 'N/A' // This would be calculated from player points
}));

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
                        Live Squad &amp; Points Status
                    </CardTitle>
                    <CardDescription>
                        This dashboard shows the live status of each house's squad, remaining purse, and total points.
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
                                        <TableCell className="text-right font-mono">{house.spent} Cr</TableCell>
                                        <TableCell className="text-right font-mono text-accent font-bold">{house.left} Cr</TableCell>
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
