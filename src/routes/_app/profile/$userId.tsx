import { ProfileFichesList } from '@/components/profile/ProfileFichesList';
import { ProfileForumActivity } from '@/components/profile/ProfileForumActivity';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SEOHead } from '@/components/seo/SEOHead';
import { usePublicProfile } from '@/hooks/useProfile';
import { generateProfilePageJsonLd, useJsonLd } from '@/lib/seo/jsonld';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/profile/$userId')({
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { userId } = Route.useParams();
  const { data: profile, isLoading, error } = usePublicProfile(userId);

  useJsonLd(profile ? generateProfilePageJsonLd(profile) : null, 'profile-jsonld');

  const displayName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Membre Zenko'
    : 'Profil';

  return (
    <div className="mx-auto flex max-w-160 flex-col gap-6 px-8 py-6">
      <SEOHead
        title={displayName}
        description={`Profil de ${displayName} sur Zenko, la plateforme d'accompagnement des enfants neurodivergents.`}
        path={`/profile/${userId}`}
        noIndex={!profile}
      />
      <h1 className="text-[32px] font-bold tracking-[-0.01em] text-text-primary">Profil</h1>

      {isLoading && <p className="text-body-sm text-text-secondary">Chargement…</p>}
      {error && <p className="text-body-sm text-danger">Impossible de charger ce profil.</p>}

      {profile && (
        <>
          <ProfileHeader profile={profile} editable={false} />
          <ProfileFichesList userId={userId} />
          <ProfileForumActivity userId={userId} />
        </>
      )}
    </div>
  );
}
