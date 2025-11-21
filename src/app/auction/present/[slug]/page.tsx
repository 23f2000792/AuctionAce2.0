
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
    // Wait for user and firestore to be available before creating the reference
    if (!firestore || !user || typeof slug !== 'string') return null;
    return doc(firestore, 'sets', slug) as DocumentReference<PlayerSet>;
  }, [firestore, user, slug]);

  const { data: set, isLoading: isLoadingSet } = useDoc<PlayerSet>(setRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // This check is important for security, ensuring a user can't access another user's set
    if (!isLoadingSet && set && user && set.userId !== user.uid) {
      notFound();
    }
  }, [set, user, isLoadingSet]);


  const isLoading = isLoadingSet || isUserLoading || !set;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-lg">Loading Presentation...</p>
      </div>
    );
  }

  if (!set) {
    // This case will be hit if the set doesn't exist or there was an issue loading it
    // that wasn't a permissions error (already handled by isLoading logic).
    // Can also be hit briefly before the loading state properly updates.
    return (
       <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-lg">Preparing auction...</p>
      </div>
    );
  }

  return <FullScreenView players={set.players} />;
}
