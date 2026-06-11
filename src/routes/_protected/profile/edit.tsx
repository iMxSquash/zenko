import { AppSidebar } from '@/components/layout/AppSidebar';
import { ProfileAccountSection } from '@/components/profile/ProfileAccountSection';
import { ProfileAvatarSection } from '@/components/profile/ProfileAvatarSection';
import { ProfileIdentitySection } from '@/components/profile/ProfileIdentitySection';
import { ProfilePasswordSection } from '@/components/profile/ProfilePasswordSection';
import { ProfileRoleSection } from '@/components/profile/ProfileRoleSection';
import { ProfileSocialSection } from '@/components/profile/ProfileSocialSection';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/lib/supabase/use-auth';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/profile/edit')({
  component: ProfileEditPage,
});

function ProfileEditPage() {
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useProfile();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[640px] flex-col gap-6 px-8 py-6">
          <h1 className="text-[32px] font-bold tracking-[-0.01em] text-text-primary">
            Modifier mon profil
          </h1>

          {isLoading && <p className="text-body-sm text-text-secondary">Chargement…</p>}
          {error && <p className="text-body-sm text-danger">Impossible de charger votre profil.</p>}

          {profile && user?.email && (
            <>
              <ProfileAvatarSection avatarUrl={profile.avatarUrl} />
              <ProfileIdentitySection profile={profile} email={user.email} />
              <ProfilePasswordSection />
              <ProfileSocialSection profile={profile} />
              <ProfileRoleSection profile={profile} />
              <ProfileAccountSection />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
