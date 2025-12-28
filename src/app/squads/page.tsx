
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, CheckCircle, AlertTriangle, Clock, Upload, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { Squad } from '@/lib/player-data';


export default function SquadsPage() {
    const [squadData, setSquadData] = useState<Squad[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const parsedData = (results.data as any[]).map(row => ({
                        id: row['House Name'], // Assuming house name is unique
                        name: row['House Name'] || 'N/A',
                        moneySpent: parseFloat(row['Total Money Spent']) || 0,
                        moneyLeft: parseFloat(row['Money Left']) || 0,
                        budgetUsed: parseFloat(row['Budget Used (in %)']) || 0,
                        budgetStatus: row['Budget Status']?.includes('OK') ? 'OK' : 'OVER',
                        eligibilityStatus: row['Eligibility Status'] || 'N/A',
                        totalPoints: row['Total No. of Points'] === '#N/A' ? 'N/A' : parseInt(row['Total No. of Points'], 10) || 0,
                    }));
                    setSquadData(parsedData);
                    toast({
                        title: 'Upload Successful',
                        description: `Squad data for ${parsedData.length} houses has been loaded.`,
                    });
                } catch(error: any) {
                     toast({
                        title: 'Processing Failed',
                        description: 'Could not process the CSV file. Check the format.',
                        variant: 'destructive',
                    });
                } finally {
                    setIsProcessing(false);
                }
            },
            error: (error: any) => {
                toast({
                    title: 'Parsing Failed',
                    description: error.message,
                    variant: 'destructive',
                });
                setIsProcessing(false);
            },
        });
    };

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
                        This dashboard shows the live status of each house's squad, purse, and points. Upload a CSV to update the data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card>
                        <CardHeader>
                             <CardTitle className="text-xl flex items-center"><Upload className="mr-2"/>Upload Squad Data</CardTitle>
                             <CardDescription>
                                Select a CSV file with the required columns to populate or update the table below.
                             </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                            <Input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                disabled={isProcessing}
                                className="file:text-primary file:font-bold"
                            />
                            {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
                        </CardContent>
                    </Card>

                    {squadData.length > 0 ? (
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
                                    {squadData.map((house) => (
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
                    ) : (
                         <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
                            <Info className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No Squad Data Uploaded</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Upload a CSV file using the control above to see the live squad status.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

