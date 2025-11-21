'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAuctionSummary } from '@/ai/flows/generate-auction-summary';
import { Input } from '@/components/ui/input';

export default function ResultsPage() {
  const [auctionName, setAuctionName] = useState('Fantasy Football Auction');
  const [winningBids, setWinningBids] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    if (!winningBids.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter the winning bids to generate a summary.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSummary('');

    try {
      const result = await generateAuctionSummary({
        auctionName,
        winningBids,
      });
      setSummary(result.summary);
      toast({
        title: 'Summary Generated!',
        description: 'The AI-powered auction summary is ready.',
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: 'Error',
        description:
          'Could not generate the summary. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">
            Generate Auction Summary
          </CardTitle>
          <CardDescription>
            Enter the auction details and winning bids to get an AI-powered
            summary of the results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auction-name">Auction Name</Label>
            <Input
              id="auction-name"
              value={auctionName}
              onChange={(e) => setAuctionName(e.target.value)}
              placeholder="e.g., Fantasy Football 2024"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="winning-bids">Winning Bids</Label>
            <Textarea
              id="winning-bids"
              className="min-h-[150px]"
              placeholder='Enter each winning bid on a new line. Format: Player Name, Bid Amount, Team Name. For example:\n\n"Player One", 55, "Team A"\n"Player Two", 42, "Team B"'
              value={winningBids}
              onChange={(e) => setWinningBids(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGenerateSummary}
            disabled={isLoading}
            className="w-full sm:w-auto ml-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <Wand2 className="mr-2" />
            )}
            Generate with AI
          </Button>
        </CardFooter>
      </Card>

      {summary && (
        <Card className="animate-in fade-in">
          <CardHeader>
            <CardTitle>Auction Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: summary }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
