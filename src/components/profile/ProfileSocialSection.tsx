import { useUpdateProfile } from '@/hooks/useProfile';
import { assertValidSocialUrl } from '@/lib/profile/socialLinks';
import type { Profile } from '@/types';
import { EditableTextField } from './EditableTextField';

interface ProfileSocialSectionProps {
  profile: Profile;
}

export function ProfileSocialSection({ profile }: ProfileSocialSectionProps) {
  const updateProfile = useUpdateProfile();

  return (
    <section className="flex flex-col gap-4 rounded-card-lg border border-border bg-surface p-6 shadow-[0px_4px_16px_0px_rgba(23,23,20,0.05)]">
      <h2 className="text-h3 font-bold text-text-primary">Réseaux sociaux</h2>
      <EditableTextField
        label="LinkedIn"
        placeholder="https://www.linkedin.com/in/..."
        value={profile.linkedinUrl ?? ''}
        onSave={async (value) => {
          assertValidSocialUrl(value, 'linkedin', 'LinkedIn');
          await updateProfile.mutateAsync({ linkedinUrl: value });
        }}
      />
      <EditableTextField
        label="Instagram"
        placeholder="https://www.instagram.com/..."
        value={profile.instagramUrl ?? ''}
        onSave={async (value) => {
          assertValidSocialUrl(value, 'instagram', 'Instagram');
          await updateProfile.mutateAsync({ instagramUrl: value });
        }}
      />
      <EditableTextField
        label="Twitter / X"
        placeholder="https://x.com/..."
        value={profile.twitterUrl ?? ''}
        onSave={async (value) => {
          assertValidSocialUrl(value, 'twitter', 'Twitter / X');
          await updateProfile.mutateAsync({ twitterUrl: value });
        }}
      />
      <EditableTextField
        label="Doctolib"
        placeholder="https://www.doctolib.fr/..."
        value={profile.doctolibUrl ?? ''}
        onSave={async (value) => {
          if (profile.role === 'expert' && !value) {
            throw new Error('Le lien Doctolib est requis pour le rôle expert.');
          }
          assertValidSocialUrl(value, 'doctolib', 'Doctolib');
          await updateProfile.mutateAsync({ doctolibUrl: value });
        }}
      />
    </section>
  );
}
