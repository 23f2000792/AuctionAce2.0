import Link from 'next/link';
import { Gavel } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Gavel className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight font-headline">Auction Ace</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
