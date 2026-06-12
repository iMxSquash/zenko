import { AvatarPicker } from '@/components/ui';
import { useAvatars } from '@/hooks/useAvatars';
import type { FieldStatus as FieldStatusValue } from '@/hooks/useEditableField';
import { useUpdateProfile } from '@/hooks/useProfile';
import { useState } from 'react';
import { FieldStatus } from './FieldStatus';

interface ProfileAvatarSectionProps {
  avatarUrl: string | null;
}

export function ProfileAvatarSection({ avatarUrl }: ProfileAvatarSectionProps) {
  const { data: avatars = [] } = useAvatars();
  const updateProfile = useUpdateProfile();
  const [status, setStatus] = useState<FieldStatusValue>('idle');
  const [error, setError] = useState<string>();

  const handleChange = (avatar: string) => {
    setStatus('saving');
    setError(undefined);
    updateProfile.mutate(
      { avatarUrl: avatar },
      {
        onSuccess: () => setStatus('saved'),
        onError: (err) => {
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
        },
      }
    );
  };

  return (
    <section className="flex flex-col gap-4 rounded-card-lg border border-border bg-surface p-6 shadow-[0px_4px_16px_0px_rgba(23,23,20,0.05)]">
      <h2 className="text-h3 font-bold text-text-primary">Photo de profil</h2>
      <AvatarPicker avatars={avatars} value={avatarUrl} onChange={handleChange} />
      <FieldStatus status={status} error={error} />
    </section>
  );
}
