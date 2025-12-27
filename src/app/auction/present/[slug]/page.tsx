
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
  const [activePlayerList, setActivePlayerList] = useState<Player[] | null>(null);

  useEffect(() => {
    if (set && set.players) {
        setActivePlayerList(shuffleArray(set.players));
    }
  }, [set]);

  const resetAuction = () => {
    if (set && set.players) {
        setActivePlayerList(shuffleArray(set.players));
    }
  }

  const isLoading = isLoadingSet || isUserLoading || !activePlayerList;

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <p className="text-lg">Loading Presentation...</p>
      </div>
    );
  }

  if (!set || !activePlayerList) {
    notFound();
    return null;
  }

  return <FullScreenView players={activePlayerList} set={set} onReset={resetAuction} />;
}
