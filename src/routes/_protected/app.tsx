import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { signOut } from '@/lib/supabase/auth';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/app')({
  component: AppPage,
});

const FEATURES = [
  {
    id: 'bibliotheque',
    title: 'Bibliothèque',
    description: 'Fiches et ressources',
    icon: '📚',
    bg: '#cfe7f5',
    color: '#176a99',
    to: '/bibliotheque',
  },
  {
    id: 'forum',
    title: 'Forum',
    description: 'Discussions et partage',
    icon: '💬',
    bg: '#fde8ef',
    color: '#b05c7a',
    to: '/forum',
  },
  {
    id: 'assistant',
    title: 'Assistant',
    description: 'Chat vocal intelligent',
    icon: '🎤',
    bg: '#c7f2dc',
    color: '#1a7a4a',
    to: '/assistant',
  },
  {
    id: 'profil',
    title: 'Mon profil',
    description: 'Préférences et compte',
    icon: '✨',
    bg: '#fce2d2',
    color: '#a03f0e',
    to: '/onboarding',
  },
] as const;

function AppPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/90 px-5 py-3 backdrop-blur-sm">
        <ZenkoLogo width={108} />
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate({ to: '/' });
          }}
          className="rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-neutral-100 hover:text-[#171614]"
        >
          Déconnexion
        </button>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#171614]">Bonjour 👋</h1>
          <p className="mt-1 text-sm text-text-secondary">Que souhaitez-vous faire aujourd'hui ?</p>
        </div>

        {/* Color stripe */}
        <div className="mb-6 flex h-1 overflow-hidden rounded-full">
          <div className="flex-1" style={{ background: '#419FD7' }} />
          <div className="flex-1" style={{ background: '#F7A4C0' }} />
          <div className="flex-1" style={{ background: '#20CA73' }} />
          <div className="flex-1" style={{ background: '#EF6A22' }} />
          <div className="flex-1" style={{ background: '#FCD808' }} />
        </div>

        {/* Feature tiles */}
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => navigate({ to: f.to })}
              className="rounded-2xl p-5 text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: f.bg }}
            >
              <span className="mb-3 block text-2xl">{f.icon}</span>
              <p className="text-sm font-semibold" style={{ color: f.color }}>
                {f.title}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: f.color, opacity: 0.75 }}>
                {f.description}
              </p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
