"use client";

import React, { createContext, useState, ReactNode } from 'react';

type AppContextType = {
  players: string[];
  setPlayers: React.Dispatch<React.SetStateAction<string[]>>;
  shuffledPlayers: string[];
  setShuffledPlayers: React.Dispatch<React.SetStateAction<string[]>>;
};

export const AppContext = createContext<AppContextType>({
  players: [],
  setPlayers: () => {},
  shuffledPlayers: [],
  setShuffledPlayers: () => {},
});

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<string[]>([]);
  const [shuffledPlayers, setShuffledPlayers] = useState<string[]>([]);

  return (
    <AppContext.Provider value={{ players, setPlayers, shuffledPlayers, setShuffledPlayers }}>
      {children}
    </AppContext.Provider>
  );
};
