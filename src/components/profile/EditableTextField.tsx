import { TextInput } from '@/components/ui';
import { useEditableField } from '@/hooks/useEditableField';
import { FieldStatus } from './FieldStatus';

interface EditableTextFieldProps {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  savedMessage?: string;
  onSave: (value: string) => Promise<void>;
}

export function EditableTextField({
  label,
  value,
  type = 'text',
  placeholder,
  savedMessage,
  onSave,
}: EditableTextFieldProps) {
  const { draft, setDraft, status, error, commit } = useEditableField(value, onSave);

  return (
    <div className="flex flex-col gap-1.5">
      <TextInput
        label={label}
        type={type}
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
      />
      <FieldStatus status={status} error={error} savedMessage={savedMessage} />
    </div>
  );
}
