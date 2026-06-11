import { RoleSelector } from '@/components/ui';
import type { FieldStatus as FieldStatusValue } from '@/hooks/useEditableField';
import { useUpdateRole } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types';
import type { ForumUserRole } from '@/types';
import { useState } from 'react';
import { FieldStatus } from './FieldStatus';

interface ProfileRoleSectionProps {
  profile: Profile;
  className?: string;
}

export function ProfileRoleSection({ profile, className }: ProfileRoleSectionProps) {
  const updateRole = useUpdateRole();
  const [status, setStatus] = useState<FieldStatusValue>('idle');
  const [error, setError] = useState<string>();

  const handleChange = (role: ForumUserRole) => {
    setStatus('saving');
    setError(undefined);
    updateRole.mutate(
      { role, doctolibUrl: profile.doctolibUrl },
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
    <section
      className={cn(
        'flex flex-col gap-4 rounded-card-lg border border-border bg-surface p-6 shadow-[0px_4px_16px_0px_rgba(23,23,20,0.05)]',
        className
      )}
    >
      <h2 className="text-h3 font-bold text-text-primary">Rôle</h2>
      <RoleSelector value={profile.role} onChange={handleChange} />
      <FieldStatus status={status} error={error} savedMessage="Rôle mis à jour." />
    </section>
  );
}
