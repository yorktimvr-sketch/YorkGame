
export interface WheelData {
  [category: string]: string[];
}

export interface User {
  username: string;
}

export type GameState = 'AUTH' | 'WELCOME' | 'GAME';

export interface FightingStats {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  dateStr: string;
  category: string;
  item: string;
  imageDataUrl: string;
}
