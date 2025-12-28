'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const rules = [
  {
    title: 'Bidding Process',
    content: 'Each player will be presented one by one. Bidding starts at the player\'s reserve price. Bids must be made in increments of at least 1 Lakh. The highest bidder at the end of the time limit wins the player.',
  },
  {
    title: 'Team Composition',
    content: 'Each team must have a minimum of 15 players and a maximum of 25 players. The squad must include a minimum of 5 specialist batsmen and 5 specialist bowlers.',
  },
  {
    title: 'Salary Cap',
    content: 'Each team has a total salary cap of 90 Crores. The total amount spent on players cannot exceed this cap. Unspent funds will not carry over.',
  },
  {
    title: 'Player Categories',
    content: 'Players are categorized as Capped, Uncapped, or Associate. Each team must have a certain number of players from each category as specified in the auction guidelines.',
  },
  {
    title: 'Tie-Breaker',
    content: 'In the event of a tie bid, a rapid-fire bidding round will commence between the tied bidders. If no further bids are made, the winner will be decided by a coin toss.',
  },
   {
    title: 'Unsold Players',
    content: 'Players who go unsold in the initial round may be brought back for a final accelerated bidding round at the end of the auction, at the discretion of the auctioneer.',
  },
];

export default function RulebookPage() {
  return (
    <motion.div 
        className="w-full max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
      <Card className="glow-border bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl">
            <BookOpen className="mr-3 h-8 w-8 text-primary" />
            Auction Rulebook
          </CardTitle>
          <CardDescription>
            The official rules and regulations for the auction process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {rules.map((rule, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">{rule.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{rule.content}</p>
                        </CardContent>
                    </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
