import type { ForumUserRole, ResourceCategory } from '@/types';
import { describe, expect, it } from 'vitest';
import { CATEGORIES, ROLE_CAPSULE_BG, ROLE_LABELS } from './forum';

const ALL_ROLES: ForumUserRole[] = ['parent', 'prof', 'expert'];
const ALL_CATEGORIES: ResourceCategory[] = ['TSA', 'TDAH', 'DYS', 'TDI'];

describe('ROLE_LABELS', () => {
  it('couvre tous les rôles', () => {
    for (const role of ALL_ROLES) {
      expect(ROLE_LABELS[role]).toBeDefined();
    }
  });

  it('retourne les libellés corrects', () => {
    expect(ROLE_LABELS.parent).toBe('Parent');
    expect(ROLE_LABELS.prof).toBe('Enseignant·e');
    expect(ROLE_LABELS.expert).toBe('Expert·e');
  });
});

describe('ROLE_CAPSULE_BG', () => {
  it('couvre tous les rôles', () => {
    for (const role of ALL_ROLES) {
      expect(ROLE_CAPSULE_BG[role]).toBeDefined();
    }
  });

  it('retourne des classes Tailwind non vides', () => {
    for (const role of ALL_ROLES) {
      expect(ROLE_CAPSULE_BG[role].trim()).not.toBe('');
    }
  });
});

describe('CATEGORIES', () => {
  it('contient toutes les catégories', () => {
    expect(CATEGORIES).toHaveLength(ALL_CATEGORIES.length);
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORIES).toContain(cat);
    }
  });
});
