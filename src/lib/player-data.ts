import { DocumentData } from "firebase/firestore";

export interface Player extends DocumentData {
  id: string;
  playerName: string;
  playerNumber: number;
  userId: string;
}

export interface AuctionOrderItem {
  player: Player;
  orderNumber: number;
}

export interface PlayerSet extends DocumentData {
  id: string;
  name: string;
  players: Player[];
  userId: string;
  order?: AuctionOrderItem[];
  pinHash?: string;
}
