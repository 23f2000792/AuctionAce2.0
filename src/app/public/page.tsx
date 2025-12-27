
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Sheet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const rules = [
    { title: 'Auction Format', content: 'The auction will be conducted in an IPL-style format. Each player will be presented one by one for bidding.' },
    { title: 'Bidding', content: 'Teams will take turns bidding for players. The highest bidder wins the player for their squad.' },
    { title: 'Team Budgets', content: 'Each team has a starting budget of 100 Crores. All player purchases will be deducted from this budget. Exceeding the budget is not allowed.' },
    { title: 'Squad Composition', content: 'Each team must have a minimum of 18 players and a maximum of 25 players. The squad must include a specific number of batters, bowlers, and all-rounders.' },
    { title: 'Unsold Players', content: 'Players who go unsold in the initial round may be brought back for a rapid-fire round at the end of the auction.' },
  ];

  const GOOGLE_SHEET_EMBED_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-EXAMPLE-URL-REPLACE-ME/pubhtml?widget=true&amp;headers=false";


  return (
    <motion.div 
      className="w-full max-w-5xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="glow-border bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center">
              <BookOpen className="mr-3 text-secondary" />
              Auction Rulebook
            </CardTitle>
            <CardDescription>
              Welcome, participants! Please familiarize yourself with the official rules of the auction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {rules.map((rule, index) => (
                 <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-lg hover:no-underline font-headline tracking-normal text-primary-foreground/90">
                      {rule.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                      {rule.content}
                    </AccordionContent>
                  </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="glow-border bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center">
              <Sheet className="mr-3 text-secondary" />
              Live Auction Tracker
            </CardTitle>
            <CardDescription>
              Track team budgets, player purchases, and squad status in real-time using the embedded tracker below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-border">
              <iframe
                src={GOOGLE_SHEET_EMBED_URL}
                className="w-full h-full"
                frameBorder="0"
                title="Live Auction Tracker"
              >
                Loading live tracker...
              </iframe>
            </div>
             <p className="text-sm text-muted-foreground mt-4">
                Note: The tracker is embedded from a Google Sheet. Make sure you have the correct link provided by the auction organizer.
              </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
