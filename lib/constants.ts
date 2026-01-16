
import { StyleOption, StyleType } from './types';

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: StyleType.WOOD,
    label: { zh: '中式椴木雕', en: 'Linden Woodcarving' },
    description: { zh: '手工凿刻痕迹，温润的木质纤维纹理', en: 'Hand-chiseled textures with warm timber grains' },
    promptKeyword: 'artisanal linden wood carving, realistic wood grain, hand-chiseled texture, natural finish, warm timber tones',
    previewColor: 'bg-[#8B5E3C]'
  },
  {
    id: StyleType.CLAY,
    label: { zh: '大地陶泥塑', en: 'Earthenware Clay' },
    description: { zh: '原始的陶泥质感，保留手工揉捏的呼吸感', en: 'Rustic clay sculpture with minimalist hand-molded form' },
    promptKeyword: 'rustic earthenware clay sculpture, wet clay texture, minimalist hand-molded form, earthy terracotta colors',
    previewColor: 'bg-[#A67B5B]'
  },
  {
    id: StyleType.PIXEL,
    label: { zh: '摩登像素砖', en: 'Modern Pixel Art' },
    description: { zh: '几何美学重组，活泼的色彩方块拼贴', en: 'Vibrant digital blocks with sharp geometric abstraction' },
    promptKeyword: 'sophisticated high-definition pixel art, geometric abstraction, vibrant digital blocks, sharp edge definition',
    previewColor: 'bg-[#3B82F6]'
  },
  {
    id: StyleType.OIL,
    label: { zh: '写实厚涂油彩', en: 'Impasto Oil Painting' },
    description: { zh: '沉稳的古典笔触，层叠叠加的厚重油彩', en: 'Heavy brushstrokes with rich classical color layering' },
    promptKeyword: 'hyper-realistic oil painting, impasto technique, visible heavy brushstrokes, rich color layering, classical studio lighting',
    previewColor: 'bg-[#991B1B]'
  }
];

export const CREDIT_RULES = {
  INITIAL: 5,
  COST_PER_GEN: 1,
  INVITE_REWARD: 2
};
