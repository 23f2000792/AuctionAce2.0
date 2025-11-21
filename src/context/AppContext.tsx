"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Player, PlayerSet } from '@/lib/player-data';

interface AppContextType {
  players: Player[];
  sets: PlayerSet[];
  addPlayer: (player: Omit<Player, 'id'>) => void;
  deletePlayer: (playerId: number) => void;
  addSet: (set: Omit<PlayerSet, 'id'>) => void;
  deleteSet: (setId: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sets, setSets] = useState<PlayerSet[]>([]);

  // Implement logic to load from and save to localStorage here
  // For simplicity, this is a basic in-memory implementation

  const addPlayer = (player: Omit<Player, 'id'>) => {
    setPlayers(prev => [...prev, { ...player, id: Date.now() }]);
  };

  const deletePlayer = (playerId: number) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };
  
  const addSet = (set: Omit<PlayerSet, 'id'>) => {
    setSets(prev => [...prev, { ...set, id: Date.now() }]);
  };

  const deleteSet = (setId: number) => {
    setSets(prev => prev.filter(s => s.id !== setId));
  };

  return (
    <AppContext.Provider value={{ players, sets, addPlayer, deletePlayer, addSet, deleteSet }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
