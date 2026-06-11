import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full px-6 py-4 font-display text-[16px] font-semibold leading-4 transition-opacity disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        primary: 'bg-brand-100 text-[#f4f4f7] hover:opacity-90',
        outline:
          'border border-border-default bg-transparent text-text-primary hover:bg-background',
        danger: 'bg-danger text-[#f4f4f7] hover:opacity-90',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
