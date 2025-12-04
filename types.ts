export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Goal {
  id: string;
  title: string;
  completed: boolean;
  subTasks?: Goal[]; // Recursive for micro-steps
  category: 'study' | 'life' | 'social';
  createdAt: number;
}

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  level: number; // 1-5
  note?: string;
}

export enum AppRoute {
  DASHBOARD = '/',
  CHAT = '/chat',
  GOALS = '/goals',
  INSPIRATION = '/inspiration'
}