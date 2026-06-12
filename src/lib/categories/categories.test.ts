import type { ResourceCategory } from '@/types';
import { describe, expect, it } from 'vitest';
import { CATEGORY_CAPSULE_BG } from './categories';

const ALL_CATEGORIES: ResourceCategory[] = ['TSA', 'DYS', 'TDAH', 'TDI'];

describe('CATEGORY_CAPSULE_BG', () => {
  it('couvre toutes les catégories', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_CAPSULE_BG[cat]).toBeDefined();
    }
  });

  it('retourne des classes Tailwind non vides', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_CAPSULE_BG[cat].trim()).not.toBe('');
    }
  });

  it('TSA utilise orange-25', () => expect(CATEGORY_CAPSULE_BG.TSA).toBe('bg-orange-25'));
  it('DYS utilise jaune-50', () => expect(CATEGORY_CAPSULE_BG.DYS).toBe('bg-jaune-50'));
  it('TDAH utilise vert-25', () => expect(CATEGORY_CAPSULE_BG.TDAH).toBe('bg-vert-25'));
  it('TDI utilise bleu-25', () => expect(CATEGORY_CAPSULE_BG.TDI).toBe('bg-bleu-25'));
});
