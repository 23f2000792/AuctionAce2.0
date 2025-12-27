
'use client';

import { useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { PlayerSet } from '@/lib/player-data';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import FullScreenView from '@/components/FullScreenView';

export default function PresentPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const setRef = useMemoFirebase(() => {
    // Public sets can be viewed without a user, so we don't depend on user here.
    if (!firestore || typeof slug !== 'string') return null;
    return doc(firestore, 'sets', slug) as DocumentReference<PlayerSet>;
  }, [firestore, slug]);

  const { data: set, isLoading: isLoadingSet } = useDoc<PlayerSet>(setRef);

  useEffect(() => {
    // If the set has a PIN, it's private.
    // If a user is not logged in OR the user doesn't own this private set, deny access.
    if (set && set.hashedPin && (!user || user.uid !== set.userId)) {
      notFound();
    }
  }, [set, user, isUserLoading, router]);

  const isLoading = isLoadingSet || isUserLoading;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-lg">Loading Presentation...</p>
      </div>
    );
  }

  if (!set) {
    notFound();
    return null;
  }

  // Use the locked order if it exists, otherwise use the original player list.
  const playersToPresent = set.lockedOrder || set.players;

  return <FullScreenView players={playersToPresent} set={set} />;
}
