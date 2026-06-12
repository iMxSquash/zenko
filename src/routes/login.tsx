import { SEOHead } from '@/components/seo/SEOHead';
import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { signInWithPassword, signUpWithPassword } from '@/lib/supabase/auth';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

type Search = { mode?: 'login' | 'signup' };

export const Route = createFileRoute('/login')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s.mode === 'signup' ? 'signup' : 'login',
  }),
  component: LoginPage,
});

function LoginPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const isSignup = mode === 'signup';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithPassword(email, password);
      navigate({ to: '/app' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-white">
      <SEOHead
        title={isSignup ? 'Créer un compte' : 'Connexion'}
        description="Connectez-vous ou créez votre compte Zenko pour accompagner les enfants neurodivergents avec l'école, la famille et les spécialistes."
        path="/login"
      />

      {/* Logo absolu en haut à gauche — overlay sur tout le layout */}
      <div className="absolute left-16 top-16 z-20">
        <ZenkoLogo width={145} />
      </div>

      {/* Blob 22 — top, brand, positionné sur <main> */}
      <div
        className="pointer-events-none fixed -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: '#419FD7', opacity: 0.08 }}
      />
      <div
        className="pointer-events-none fixed -bottom-20 -right-20 h-80 w-80 rounded-full blur-3xl"
        style={{ background: '#20CA73', opacity: 0.08 }}
      />
      <div
        className="pointer-events-none fixed top-1/2 right-0 h-56 w-56 rounded-full blur-3xl"
        style={{ background: '#FCD808', opacity: 0.07 }}
      />

      <div className="relative w-full max-w-[400px]">
        {/* Logo + tagline */}
        <div className="mb-8 flex flex-col items-center">
          <ZenkoLogo width={168} />
          <p className="mt-3 text-center text-sm text-[#5a5750]">
            Accompagnement des enfants neurodivergents
          </p>
        </div>
      </div>

      {/* ── Panneau droit — formulaire (743/1440 = ~51.6%) ── */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden p-3 lg:w-[51.6%]">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 self-start pl-4">
          <ZenkoLogo width={120} />
        </div>

        {/* Card */}
        <div className="rounded-[32px] bg-[rgba(207,231,245,0.12)] p-8">
          <div className="flex w-full flex-col gap-8 lg:w-[442px]">
            {/* Header */}
            <div className="flex flex-col gap-2.5">
              <h1
                className="font-bold text-black"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '28px',
                  lineHeight: '36px',
                  letterSpacing: '-0.084px',
                }}
              >
                Connexion
              </h1>
              <div
                className="flex flex-col gap-1"
                style={{ fontSize: 'var(--text-body-sm)', lineHeight: '20px' }}
              >
                <p className="text-text-secondary">Remplissez le formulaire pour rejoindre Zenko</p>
                <p>
                  <span className="text-danger">*</span>
                  <span className="text-text-secondary">Champs obligatoires</span>
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                {error && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3">
                    <span className="text-sm">⚠️</span>
                    <p className="text-danger" style={{ fontSize: 'var(--text-body-sm)' }}>
                      {error}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="email"
                      className="font-bold text-text-secondary"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        lineHeight: '24px',
                      }}
                    >
                      EMAIL
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="mail@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl bg-stone-50 p-3 text-text-primary border border-border-default transition-all focus:border-brand focus:outline-none"
                      style={{ fontSize: 'var(--text-body-sm)' }}
                    />
                  </div>

                  {/* Mot de passe */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="password"
                      className="font-bold text-text-secondary"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        lineHeight: '24px',
                      }}
                    >
                      MOT DE PASSE
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="••••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl bg-stone-50 p-3 text-text-primary border border-border-default transition-all focus:border-brand focus:outline-none"
                      style={{ fontSize: 'var(--text-body-sm)' }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="submit"
                      disabled={loading}
                      className={
                        email && password && !loading
                          ? 'w-full rounded-full bg-brand px-6 py-4 font-display font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99]'
                          : 'w-full rounded-full px-6 py-4 font-display font-semibold text-text-muted outline outline-1 outline-offset-[-1px] outline-border-default transition-all'
                      }
                      style={{ fontSize: 'var(--text-button)', lineHeight: '16px' }}
                    >
                      {loading ? '…' : 'Se connecter'}
                    </button>

                    <p
                      className="text-center text-text-secondary"
                      style={{ fontSize: 'var(--text-body-sm)', lineHeight: '20px' }}
                    >
                      Pas encore de compte ?{' '}
                      <Link to="/signup" className="font-bold text-brand hover:underline">
                        S&apos;inscrire
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
