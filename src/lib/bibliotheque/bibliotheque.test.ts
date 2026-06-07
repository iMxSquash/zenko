import type { ResourceCategory } from '@/types';
import { describe, expect, it } from 'vitest';
import { CATEGORY_COVER_BG } from './bibliotheque';

const ALL_CATEGORIES: ResourceCategory[] = ['TSA', 'DYS', 'TDAH', 'TDI'];

describe('CATEGORY_COVER_BG', () => {
  it('couvre toutes les catégories', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_COVER_BG[cat]).toBeDefined();
    }
  });

  it('retourne des classes Tailwind non vides', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_COVER_BG[cat].trim()).not.toBe('');
    }
  });

  it('retourne des classes Tailwind non vides', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_COVER_BG[cat].trim()).not.toBe('');
    }
  });
});
