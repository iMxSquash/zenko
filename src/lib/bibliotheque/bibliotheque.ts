import type { ResourceCategory } from '@/types';

export const CATEGORY_COVER_BG: Record<ResourceCategory, string> = {
  TSA: 'bg-orange-75',
  DYS: 'bg-jaune-75',
  TDAH: 'bg-vert-75',
  TDI: 'bg-bleu-75',
};

export const CATEGORY_BADGE_BG: Record<ResourceCategory, string> = {
  TSA: 'bg-orange-25',
  DYS: 'bg-jaune-50',
  TDAH: 'bg-vert-25',
  TDI: 'bg-bleu-25',
};
