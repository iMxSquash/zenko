import { cn } from '@/lib/utils';
import { useId } from 'react';

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
}

export function TextInput({ label, error, className, ...props }: TextInputProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-label font-semibold uppercase tracking-label text-text-secondary"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'rounded-search border border-border-default bg-surface px-4 py-3 text-body-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand',
          error && 'border-danger',
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-body-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
