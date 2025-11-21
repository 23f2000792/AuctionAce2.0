"use client";

import Link from 'next/link';
import { Gavel, Users, PlusCircle, LogOut, LogIn, Menu } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';
import { useState } from 'react';


const Header = () => {
  const { user, isUserLoading } = useUser();
  const auth = getAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSignOut = () => {
    signOut(auth);
    setIsSheetOpen(false);
  }

  const NavContent = () => (
    <>
      { !isUserLoading && user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <PlusCircle />
              Create/Edit
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href="/players" onClick={() => setIsSheetOpen(false)}>
                <Users />
                Manage Players
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/sets/create" onClick={() => setIsSheetOpen(false)}>
                <PlusCircle />
                Create Set
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {isUserLoading ? (
         <div className="h-10 w-full animate-pulse rounded-md bg-muted/50" />
      ) : user ? (
        <Button variant="outline" onClick={handleSignOut} className="w-full justify-start">
          <LogOut /> Sign Out
        </Button>
      ) : (
        <Button asChild className="w-full justify-start">
          <Link href="/login" onClick={() => setIsSheetOpen(false)}>
            <LogIn /> Login
          </Link>
        </Button>
      )}
    </>
  );

  return (
    <header className="w-full border-b border-primary/20 bg-background/30 backdrop-blur-sm z-20">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Gavel className="h-7 w-7 text-primary group-hover:animate-pulse" />
          <span className="text-xl font-bold tracking-tight font-headline">Auction Ace</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <NavContent />
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] bg-card/80 backdrop-blur-md">
              <nav className="flex flex-col gap-4 pt-8">
                <NavContent />
              </nav>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
};

export default Header;
