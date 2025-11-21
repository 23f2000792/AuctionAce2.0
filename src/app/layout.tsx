
"use client";

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import { FirebaseClientProvider } from '@/firebase';
import { ParticleBackground } from '@/components/ParticleBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Sans:wght@400;500;600;700&family=Geist+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ParticleBackground />
        <div className="grid-background"></div>
        <FirebaseClientProvider>
          <div className="flex min-h-screen w-full flex-col">
            <Header />
            <AnimatePresence mode="wait">
              <motion.main
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8 z-10"
              >
                {children}
              </motion.main>
            </AnimatePresence>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
