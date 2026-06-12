import { cn } from '@/lib/utils';

interface AvatarPickerProps {
  avatars: string[];
  value: string | null;
  onChange: (avatarUrl: string) => void;
  className?: string;
}

export function AvatarPicker({ avatars, value, onChange, className }: AvatarPickerProps) {
  if (avatars.length === 0) {
    return <p className="text-body-sm text-text-secondary">Aucun avatar disponible.</p>;
  }

  return (
    <div className={cn('grid grid-cols-4 gap-3 sm:grid-cols-6', className)}>
      {avatars.map((avatar) => (
        <button
          key={avatar}
          type="button"
          onClick={() => onChange(avatar)}
          aria-pressed={value === avatar}
          className={cn(
            'aspect-square overflow-hidden rounded-full border-2 transition-colors',
            value === avatar ? 'border-brand' : 'border-transparent hover:border-border-default'
          )}
        >
          <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  );
}
