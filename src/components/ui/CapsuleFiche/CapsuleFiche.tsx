import { CATEGORY_CAPSULE_BG } from '@/lib/categories/categories';
import { cn } from '@/lib/utils';
import type { ResourceCategory } from '@/types';

interface CapsuleFicheProps {
  category: ResourceCategory;
  className?: string;
}

export function CapsuleFiche({ category, className }: CapsuleFicheProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-capsule px-2 py-0.75 text-capsule font-semibold uppercase tracking-capsule text-text-secondary',
        CATEGORY_CAPSULE_BG[category],
        className
      )}
    >
      {category}
    </span>
  );
}
