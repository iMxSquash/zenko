import { Button } from '@/components/ui/Button/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 px-4">
      <dialog
        open
        aria-labelledby="confirm-dialog-title"
        className="flex w-full max-w-[400px] flex-col gap-4 rounded-card-lg border-none bg-surface p-6 shadow-[0px_8px_24px_0px_rgba(23,23,20,0.15)]"
      >
        <h2 id="confirm-dialog-title" className="text-h3 font-bold text-text-primary">
          {title}
        </h2>
        <p className="text-body-sm text-text-secondary">{description}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </dialog>
    </div>
  );
}
