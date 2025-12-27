
"use client";

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

const PublicHeader = () => {
  return (
    <header className="w-full border-b border-primary/20 bg-background/80 backdrop-blur-sm z-20 sticky top-0">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/public" className="flex items-center gap-2 group">
          <ShieldCheck className="h-8 w-8 text-secondary transition-transform group-hover:scale-110" />
          <span className="text-2xl tracking-tighter font-headline">Auction Hub</span>
        </Link>
        <span className="text-sm font-medium text-muted-foreground">Participant Portal</span>
      </div>
    </header>
  );
};

export default PublicHeader;
