import Link from 'next/link';
import { Gavel, Trophy, Users, PlusCircle } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const Header = () => {
  return (
    <header className="w-full border-b border-border/40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Gavel className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight font-headline">Auction Ace</span>
        </Link>
        <nav className="flex items-center gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="mr-2" />
                Create
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/players">
                  <Users className="mr-2" />
                  Manage Players
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/sets/create">
                  <PlusCircle className="mr-2" />
                  Create Set
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" asChild>
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
