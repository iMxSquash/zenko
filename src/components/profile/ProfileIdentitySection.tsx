import { useUpdateEmail, useUpdateProfile } from '@/hooks/useProfile';
import type { Profile } from '@/types';
import { EditableTextField } from './EditableTextField';

interface ProfileIdentitySectionProps {
  profile: Profile;
  email: string;
}

export function ProfileIdentitySection({ profile, email }: ProfileIdentitySectionProps) {
  const updateProfile = useUpdateProfile();
  const updateEmail = useUpdateEmail();

  return (
    <section className="flex flex-col gap-4 rounded-card-lg border border-border bg-surface p-6 shadow-[0px_4px_16px_0px_rgba(23,23,20,0.05)]">
      <h2 className="text-h3 font-bold text-text-primary">Identité</h2>
      <EditableTextField
        label="Prénom"
        value={profile.firstName ?? ''}
        onSave={(value) => updateProfile.mutateAsync({ firstName: value })}
      />
      <EditableTextField
        label="Nom"
        value={profile.lastName ?? ''}
        onSave={(value) => updateProfile.mutateAsync({ lastName: value })}
      />
      <EditableTextField
        label="Email"
        type="email"
        value={email}
        savedMessage="Un email de confirmation a été envoyé à la nouvelle adresse."
        onSave={async (value) => {
          await updateEmail.mutateAsync(value);
        }}
      />
    </section>
  );
}
