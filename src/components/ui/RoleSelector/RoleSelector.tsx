import { cn } from '@/lib/utils';
import { ROLES } from '@/types';
import type { ForumUserRole } from '@/types';

interface RoleSelectorProps {
  value: ForumUserRole | null;
  onChange: (role: ForumUserRole) => void;
  className?: string;
}

export function RoleSelector({ value, onChange, className }: RoleSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {ROLES.map((role) => (
        <button
          key={role.id}
          type="button"
          onClick={() => onChange(role.id)}
          aria-pressed={value === role.id}
          className={cn(
            'flex w-55 flex-col gap-3 rounded-card-lg p-5 text-left transition-all',
            value === role.id
              ? 'border-2 border-brand bg-surface shadow-[0px_8px_24px_0px_rgba(47,157,212,0.15)]'
              : 'border border-border bg-surface shadow-[0px_4px_16px_0px_rgba(23,23,20,0.05)] hover:border-brand/40'
          )}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg"
            style={{ background: role.iconBg, color: role.iconColor }}
          >
            {role.icon}
          </div>
          <p className="text-body-lg font-bold text-text-primary">{role.label}</p>
          <p className="text-body-sm leading-5 text-text-secondary">{role.description}</p>
        </button>
      ))}
    </div>
  );
}
