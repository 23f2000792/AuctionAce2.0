'use server';

/**
 * @fileOverview An auction summary generator AI agent.
 *
 * - generateAuctionSummary - A function that handles the auction summary generation process.
 * - GenerateAuctionSummaryInput - The input type for the generateAuctionSummary function.
 * - GenerateAuctionSummaryOutput - The return type for the generateAuctionSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAuctionSummaryInputSchema = z.object({
  auctionName: z.string().describe('The name of the auction.'),
  winningBids: z.string().describe('A JSON array of winning bids, where each bid includes player name, winning bid amount, and team name.'),
});
export type GenerateAuctionSummaryInput = z.infer<typeof GenerateAuctionSummaryInputSchema>;

const GenerateAuctionSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the auction results.'),
});
export type GenerateAuctionSummaryOutput = z.infer<typeof GenerateAuctionSummaryOutputSchema>;

export async function generateAuctionSummary(input: GenerateAuctionSummaryInput): Promise<GenerateAuctionSummaryOutput> {
  return generateAuctionSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAuctionSummaryPrompt',
  input: {schema: GenerateAuctionSummaryInputSchema},
  output: {schema: GenerateAuctionSummaryOutputSchema},
  prompt: `You are an expert auction summarizer specializing in creating concise and informative summaries of auction results.

You will use the following information to generate a summary of the auction, highlighting key outcomes and insights.

Auction Name: {{{auctionName}}}
Winning Bids: {{{winningBids}}}

Please provide a clear and engaging summary that captures the essence of the auction results. Focus on the most important details.
`,
});

const generateAuctionSummaryFlow = ai.defineFlow(
  {
    name: 'generateAuctionSummaryFlow',
    inputSchema: GenerateAuctionSummaryInputSchema,
    outputSchema: GenerateAuctionSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
