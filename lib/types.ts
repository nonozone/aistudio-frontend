
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
  originalUrl?: string; // 保存原图用于生成分享卡片
  style: string;
  styleId: StyleType;
  timestamp: number;
  isFavorite?: boolean;
  isPublic?: boolean; // 新增：是否公开到画廊
  likes?: number; // 新增：点赞数
}

export interface PetProfile {
  id: string;
  name: string;
  breed: string;
  age: string;
  features: string;
  photos: string[];
}

export interface CreditTransaction {
  id: string;
  type: 'signup' | 'referral' | 'share' | 'generation' | 'reward' | 'purchase';
  amount: number;
  description: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  email: string;
  credits: number;
  isPremium: boolean;
  isAdmin: boolean;
  history: GeneratedImage[];
  transactions: CreditTransaction[];
  pets: PetProfile[];
  inviteCode: string;
}

export enum AppState {
  LANDING = 'LANDING',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  PROFILE = 'PROFILE',
  PRICING = 'PRICING',
  ADMIN = 'ADMIN',
  DISCOVER = 'DISCOVER'
}
