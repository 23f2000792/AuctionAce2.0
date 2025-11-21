export interface Player {
  id: number;
  playerName: string;
  playerNumber: number;
}

export interface PlayerSet {
  id: number;
  name: string;
  players: Player[];
}

// The initial data is now used as a fallback or seed, but primary data will be in localStorage.
export const allPlayers: Player[] = [];

export const sets: PlayerSet[] = [];
