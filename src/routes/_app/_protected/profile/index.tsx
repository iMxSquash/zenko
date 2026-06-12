import { ProfileForumActivity } from '@/components/profile/ProfileForumActivity';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { useProfile } from '@/hooks/useProfile';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_protected/profile/')({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile();

  return (
    <div className="mx-auto flex max-w-160 flex-col gap-6 px-8 py-6">
      <h1 className="text-[32px] font-bold tracking-[-0.01em] text-text-primary">Mon profil</h1>

      {isLoading && <p className="text-body-sm text-text-secondary">Chargement…</p>}
      {error && <p className="text-body-sm text-danger">Impossible de charger votre profil.</p>}

      {profile && (
        <>
          <ProfileHeader profile={profile} />
          <ProfileForumActivity />
        </>
      )}
    </div>
  );
}
