
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SquadsPage() {
    return (
        <motion.div
            className="w-full max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="glow-border bg-card/70 backdrop-blur-sm overflow-hidden h-[80vh] flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center text-3xl">
                        <ShieldCheck className="mr-3 h-8 w-8 text-primary" />
                        Live Squad &amp; Points Status
                    </CardTitle>
                    <CardDescription>
                        This dashboard shows the live status of each house's squad, remaining purse, and total points.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0 m-2 rounded-lg overflow-hidden">
                    <iframe
                        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSG0vAJ870WfhdjQAFJepO76r_JubLbJC3oSWA518KWniDQHs1cpBaBzVuMNnOAKoLaT-mxW39slJDL/pubhtml?gid=841946199&single=true&widget=true&headers=false"
                        className="w-full h-full border-0"
                        title="Live Squad Status"
                    ></iframe>
                </CardContent>
            </Card>
        </motion.div>
    );
}
