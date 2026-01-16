
export enum Language {
  ZH = 'zh',
  EN = 'en'
}

export enum StyleType {
  WOOD = 'WOOD',
  CLAY = 'CLAY',
  PIXEL = 'PIXEL',
  OIL = 'OIL'
}

export interface StyleOption {
  id: StyleType;
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  promptKeyword: string;
  previewColor: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  style: string;
  styleId: StyleType;
  timestamp: number;
}

export interface CreditTransaction {
  id: string;
  type: 'signup' | 'referral' | 'share' | 'generation' | 'reward' | 'purchase';
  amount: number;
  description: string;
  timestamp: number;
}

export interface UserStats {
  totalGenerations: number;
  favoriteStyle: string;
  mostUsedStyleColor: string;
  totalSpent: number;
  totalEarned: number;
}

export interface UserProfile {
  id: string;
  email: string;
  credits: number;
  history: GeneratedImage[];
  transactions: CreditTransaction[];
  inviteCode: string;
}

export enum AppState {
  LANDING = 'LANDING',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
  PRICING = 'PRICING'
}
