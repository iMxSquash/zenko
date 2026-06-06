import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <div
      className={cn(
        'flex flex-1 items-center gap-2.5 rounded-search border border-border-default bg-surface px-4 py-3',
        className
      )}
    >
      <span className="text-[16px] font-medium text-text-primary">⌕</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-body-sm text-text-primary placeholder:text-text-muted outline-none"
      />
    </div>
  );
}
