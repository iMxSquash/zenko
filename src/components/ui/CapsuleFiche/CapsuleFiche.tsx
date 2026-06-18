import { CATEGORY_CAPSULE_BG } from '@/lib/categories/categories';
import { cn } from '@/lib/utils';
import type { ResourceCategory } from '@/types';

interface CapsuleFicheProps {
  category: ResourceCategory;
  size?: 'sm' | 'lg';
  className?: string;
}

export function CapsuleFiche({ category, size = 'sm', className }: CapsuleFicheProps) {
  return (
    <span
      className={cn(
        'inline-flex self-start items-center rounded-capsule font-semibold uppercase tracking-capsule text-text-secondary',
        size === 'sm' ? 'px-2 py-0.75 text-capsule' : 'px-2 py-0.75 text-[20px] tracking-[1.2px]',
        CATEGORY_CAPSULE_BG[category],
        className
      )}
    >
      {category}
    </span>
  );
}
