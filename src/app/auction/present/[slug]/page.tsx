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
    if (!firestore || typeof slug !== 'string') return null;
    return doc(firestore, 'sets', slug) as DocumentReference<PlayerSet>;
  }, [firestore, slug]);

  const { data: set, isLoading: isLoadingSet } = useDoc<PlayerSet>(setRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (set && user && set.userId !== user.uid) {
      notFound();
    }
  }, [set, user]);


  const isLoading = isLoadingSet || isUserLoading;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-lg">Loading Presentation...</p>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-lg">Preparing auction...</p>
      </div>
    );
  }

  return <FullScreenView players={set.players} />;
}
