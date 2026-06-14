import type { ForumUserRole, ResourceCategory } from '@/types';

export { ROLE_LABELS } from '@/types';

export const ROLE_CAPSULE_BG: Record<ForumUserRole, string> = {
  parent: 'bg-rose-25',
  prof: 'bg-vert-25',
  expert: 'bg-bleu-25',
};

export const CATEGORIES: ResourceCategory[] = ['TSA', 'DYS', 'TDAH', 'TDI'];
