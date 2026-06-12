import { cn } from '@/lib/utils';

interface CapsuleProps {
  children: React.ReactNode;
  className?: string;
}

export function Capsule({ children, className }: CapsuleProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-capsule px-2 py-0.75 text-capsule font-semibold uppercase tracking-[0.06em] text-text-secondary',
        className
      )}
    >
      {children}
    </span>
  );
}
