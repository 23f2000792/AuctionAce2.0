
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
        <div className='flex items-center gap-2'>
            <Button variant="outline" asChild>
                <Link href="/players" onClick={() => setIsSheetOpen(false)}>
                    <Users /> Manage Players
                </Link>
            </Button>
             <Button variant="outline" asChild>
                <Link href="/sets/create" onClick={() => setIsSheetOpen(false)}>
                    <PlusCircle /> Create Set
                </Link>
            </Button>
        </div>
      )}
      {isUserLoading ? (
         <div className="h-10 w-24 animate-pulse rounded-md bg-muted/50" />
      ) : user ? (
        <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start md:w-auto">
          <LogOut /> Sign Out
        </Button>
      ) : (
        <Button asChild className="btn-glow">
          <Link href="/login" onClick={() => setIsSheetOpen(false)}>
            <LogIn /> Login
          </Link>
        </Button>
      )}
    </>
  );

  return (
    <header className="w-full border-b border-primary/20 bg-background/50 backdrop-blur-sm z-20 sticky top-0">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Gavel className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
          <span className="text-2xl font-bold tracking-tighter font-headline">Auction Ace</span>
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
