import type { ForumUserRole, ResourceCategory } from '@/types';

export const ROLE_LABELS: Record<ForumUserRole, string> = {
  parent: 'Parent',
  prof: 'Enseignant-e',
  expert: 'Expert-e',
};

export const ROLE_CAPSULE_BG: Record<ForumUserRole, string> = {
  parent: 'bg-rose-25',
  prof: 'bg-vert-25',
  expert: 'bg-bleu-25',
};

export const CATEGORY_CAPSULE_BG: Record<ResourceCategory, string> = {
  TSA: 'bg-orange-25',
  TDAH: 'bg-rose-25',
  DYS: 'bg-bleu-25',
  TDI: 'bg-vert-25',
};

export const CATEGORIES: ResourceCategory[] = ['TSA', 'DYS', 'TDAH', 'TDI'];
