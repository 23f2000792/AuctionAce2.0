'use server';

/**
 * @fileOverview Provides a PIN suggestion for securing the auction order.
 *
 * - suggestPin - A function that suggests a PIN.
 * - SuggestPinOutput - The return type for the suggestPin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPinOutputSchema = z.object({
  pin: z.string().describe('A suggested 4-digit PIN.'),
});
export type SuggestPinOutput = z.infer<typeof SuggestPinOutputSchema>;

export async function suggestPin(): Promise<SuggestPinOutput> {
  return suggestPinFlow();
}

const prompt = ai.definePrompt({
  name: 'suggestPinPrompt',
  output: {schema: SuggestPinOutputSchema},
  prompt: `You are an auction assistant. Please suggest a random 4-digit PIN to secure the auction order. Make sure it's four digits and only digits. Do not start with a zero.`,
});

const suggestPinFlow = ai.defineFlow(
  {
    name: 'suggestPinFlow',
    outputSchema: SuggestPinOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
