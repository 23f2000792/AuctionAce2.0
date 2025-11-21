import Link from 'next/link';
import { Gavel, Trophy } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  return (
    <header className="w-full border-b border-border/40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Gavel className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight font-headline">Auction Ace</span>
        </Link>
        <nav>
          <Button variant="outline" asChild>
            <Link href="/results">
              <Trophy className="mr-2" />
              Auction Results
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
