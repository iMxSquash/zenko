import { Button } from '@/components/ui';
import type { Profile } from '@/types';
import { Link } from '@tanstack/react-router';
import { Instagram, Linkedin, Stethoscope, Twitter } from 'lucide-react';

interface ProfileHeaderProps {
  profile: Profile;
}

const SOCIAL_LINKS: Array<{
  key: keyof Pick<Profile, 'linkedinUrl' | 'instagramUrl' | 'twitterUrl' | 'doctolibUrl'>;
  label: string;
  icon: typeof Linkedin;
  expertOnly?: boolean;
}> = [
  { key: 'linkedinUrl', label: 'LinkedIn', icon: Linkedin },
  { key: 'instagramUrl', label: 'Instagram', icon: Instagram },
  { key: 'twitterUrl', label: 'Twitter / X', icon: Twitter },
  { key: 'doctolibUrl', label: 'Doctolib', icon: Stethoscope, expertOnly: true },
];

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');

  const links = SOCIAL_LINKS.filter(
    (link) => profile[link.key] && (!link.expertOnly || profile.role === 'expert')
  );

  return (
    <section className="flex flex-col gap-4 rounded-card-lg border border-border bg-surface p-6 shadow-[0px_4px_16px_0px_rgba(23,23,20,0.05)]">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-background" />
          )}
          <div className="flex flex-col gap-1">
            <p className="text-h3 font-bold text-text-primary">{fullName || 'Profil'}</p>
            <p className="text-body-sm text-text-secondary">{profile.email}</p>
          </div>
        </div>

        <Link to="/profile/edit">
          <Button variant="outline">Modifier le profil</Button>
        </Link>
      </div>

      {links.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {links.map(({ key, label, icon: Icon }) => (
            <a
              key={key}
              href={profile[key] ?? undefined}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-default text-text-secondary transition-colors hover:border-brand hover:text-brand"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
