"use client";

import Link from 'next/link';
import { Gavel, Users, PlusCircle, LogOut, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useUser } from '@/firebase';
import { getAuth, signOut } from 'firebase/auth';


const Header = () => {
  const { user, isUserLoading } = useUser();
  const auth = getAuth();

  const handleSignOut = () => {
    signOut(auth);
  }

  return (
    <header className="w-full border-b border-border/40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Gavel className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight font-headline">Auction Ace</span>
        </Link>
        <nav className="flex items-center gap-4">
          { !isUserLoading && user && (
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
          )}
          {isUserLoading ? (
             <div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2" /> Sign Out
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2" /> Login
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
