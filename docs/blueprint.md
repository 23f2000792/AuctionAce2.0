# **App Name**: Auction Ace

## Core Features:

- Player Data Input: Accepts player data from CSV upload, pasted lists, or manual entry, then validates and removes duplicates.
- Random Order Generator: Generates a random auction order using the Fisher-Yates shuffle algorithm.
- Order Preview and Regeneration: Displays the generated order, allowing users to regenerate it until satisfied.
- Final Order Locking: Locks the final order by requiring a PIN, hashing it with SHA-256, and storing it in Firestore, while preventing modifications.
- Firestore Storage: Stores the locked auction order with hashed PIN in Firestore for persistence.
- Public Final Order Display: Displays the locked final order with a timestamp on a public page, with large fonts and full-screen display mode for live auctions. Full-screen tool support is provided via browser capabilities. 
- Keyboard Navigation: Enables keyboard navigation (arrow keys) in full-screen mode for easy player switching.

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082) for a professional, authoritative feel.
- Background color: Very light grey (#F5F5F5), almost white.
- Accent color: Violet (#8A2BE2) to provide a contrasting tone for action items, calls to action and highlights.
- Body and headline font: 'Inter' (sans-serif) for a clean, modern, readable aesthetic.
- Code font: 'Source Code Pro' for displaying SHA-256 hashed PIN values (if needed).
- Minimalist, line-based icons for actions like upload, regenerate, and lock.
- Smooth fade-in and slide transitions when navigating players or transitioning between views.