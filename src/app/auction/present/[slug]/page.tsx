'use client';

import { useEffect, useState, useMemo } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Player, PlayerSet } from '@/lib/player-data';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import FullScreenView from '@/components/FullScreenView';

export default function PresentPage() {
  const [orderedPlayers, setOrderedPlayers] = useState<{ player: Player; orderNumber: number }[]>([]);
  const router = useRouter();
  const params = useParams();
  const { slug } = params;

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
    if (set) {
      if (user && set.userId !== user.uid) {
        notFound();
        return;
      }
      if (!set.order) {
        // If order isn't set, redirect to the setup page
        router.push(`/auction/order/${slug}`);
      } else {
        setOrderedPlayers(set.order);
      }
    }
  }, [set, user, router, slug]);

  const isLoading = isLoadingSet || isUserLoading;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-lg">Loading Presentation...</p>
      </div>
    );
  }

  if (!set || !set.order) {
    // This can happen briefly before redirect, or if doc doesn't exist
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-lg">Preparing auction...</p>
      </div>
    );
  }
  
  if (orderedPlayers.length === 0) {
     return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-lg">Loading players...</p>
      </div>
    );
  }

  const presentationPlayers = orderedPlayers.map(item => ({
    id: item.player.id,
    playerName: item.player.playerName,
    playerNumber: item.player.playerNumber,
    orderNumber: item.orderNumber,
  }));

  return <FullScreenView players={presentationPlayers} />;
}
