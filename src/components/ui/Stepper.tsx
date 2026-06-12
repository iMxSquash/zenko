import { cn } from '@/lib/utils';

interface StepperProps {
  steps: readonly string[];
  currentStep: number; // 1-indexed
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {steps.map((label, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isDone = step < currentStep;

        return (
          <div key={label} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-label font-bold',
                  isActive || isDone ? 'bg-brand text-white' : 'bg-border text-[#7a766d]'
                )}
              >
                {isDone ? '✓' : step}
              </div>
              <span
                className={cn(
                  'text-[13px] font-semibold',
                  isActive || isDone ? 'text-text-primary' : 'text-[#7a766d]'
                )}
              >
                {label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className={cn('h-0.5 w-10', isDone ? 'bg-brand' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
