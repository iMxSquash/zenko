import { cn } from '@/lib/utils';

interface RoleOptionCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function RoleOptionCard({
  id,
  title,
  description,
  icon,
  iconBg,
  iconColor,
  selected,
  onSelect,
}: RoleOptionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn(
        'flex size-[280px] flex-col gap-4 rounded-card-lg p-8 text-left transition-all',
        selected
          ? 'border-2 border-brand bg-surface shadow-[0px_8px_24px_0px_rgba(47,157,212,0.15)]'
          : 'border border-border bg-surface shadow-[0px_4px_16px_0px_rgba(23,23,20,0.05)] hover:border-brand/40'
      )}
    >
      {/* Icon badge */}
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>

      {/* Title */}
      <p className="text-h3 font-bold text-text-primary">{title}</p>

      {/* Description */}
      <p className="text-body-sm leading-[22px] text-text-secondary">{description}</p>
    </button>
  );
}
