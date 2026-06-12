import { ProfileForumActivity } from '@/components/profile/ProfileForumActivity';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { usePublicProfile } from '@/hooks/useProfile';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/_app/profile/$userId')({
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { userId } = Route.useParams();
  const { data: profile, isLoading, error } = usePublicProfile(userId);

  return (
    <div className="mx-auto flex max-w-160 flex-col gap-6 px-8 py-6">
      <h1 className="text-[32px] font-bold tracking-[-0.01em] text-text-primary">Profil</h1>

      {isLoading && <p className="text-body-sm text-text-secondary">Chargement…</p>}
      {error && <p className="text-body-sm text-danger">Impossible de charger ce profil.</p>}

      {profile && (
        <>
          <ProfileHeader profile={profile} editable={false} />
          <ProfileForumActivity userId={userId} />
        </>
      )}
    </div>
  );
}
