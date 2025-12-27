
'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Player, PlayerSet } from '@/lib/player-data';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import FullScreenView from '@/components/FullScreenView';
import { shuffleArray } from '@/lib/utils';

export default function PresentPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;

  const { isUserLoading } = useUser();
  const firestore = useFirestore();

  const setRef = useMemoFirebase(() => {
    if (!firestore || typeof slug !== 'string') return null;
    return doc(firestore, 'sets', slug) as DocumentReference<PlayerSet>;
  }, [firestore, slug]);

  const { data: set, isLoading: isLoadingSet } = useDoc<PlayerSet>(setRef);
  const [shuffledPlayers, setShuffledPlayers] = useState<Player[] | null>(null);

  useEffect(() => {
    if (set && set.players) {
      setShuffledPlayers(shuffleArray(set.players));
    }
  }, [set]);

  const isLoading = isLoadingSet || isUserLoading || !shuffledPlayers;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-lg">Loading Presentation...</p>
      </div>
    );
  }

  if (!set || !shuffledPlayers) {
    notFound();
    return null;
  }

  return <FullScreenView players={shuffledPlayers} set={set} />;
}
