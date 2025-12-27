import { DocumentData } from "firebase/firestore";

export interface Player extends DocumentData {
  id: string;
  playerName: string;
  playerNumber: number;
  userId: string;
  firstName: string;
  surname?: string;
  country?: string;
  specialism?: string;
  cua?: string; // Capped/Uncapped/Associate
  reservePrice?: number;
  points?: number;
}

export interface PlayerSet extends DocumentData {
  id: string;
  name: string;
  players: Player[];
  userId: string;
}
