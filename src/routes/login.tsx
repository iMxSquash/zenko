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

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        await signUpWithPassword(email, password);
      } else {
        await signInWithPassword(email, password);
      }
      navigate({ to: '/bibliotheque' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafaf9] flex flex-col items-center justify-center px-4 py-12">
      <SEOHead
        title={isSignup ? 'Créer un compte' : 'Connexion'}
        description="Connectez-vous ou créez votre compte Zenko pour accompagner les enfants neurodivergents avec l'école, la famille et les spécialistes."
        path="/login"
      />
      {/* Decorative blobs */}
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

        {/* Color stripe */}
        <div className="mb-6 flex h-1 overflow-hidden rounded-full">
          <div className="flex-1" style={{ background: '#419FD7' }} />
          <div className="flex-1" style={{ background: '#F7A4C0' }} />
          <div className="flex-1" style={{ background: '#20CA73' }} />
          <div className="flex-1" style={{ background: '#EF6A22' }} />
          <div className="flex-1" style={{ background: '#FCD808' }} />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#e8e7e3] bg-white p-6 shadow-sm">
          <h1 className="mb-5 text-xl font-semibold text-[#171614]">
            {isSignup ? 'Créer un compte' : 'Bon retour 👋'}
          </h1>

          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-[#5a5750]">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full rounded-xl border border-[#e8e7e3] bg-[#fafaf9] px-4 py-2.5 text-sm outline-none transition-all focus:border-[#419FD7] focus:bg-white focus:ring-2 focus:ring-[#419FD7]/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-[#5a5750]">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full rounded-xl border border-[#e8e7e3] bg-[#fafaf9] px-4 py-2.5 text-sm outline-none transition-all focus:border-[#419FD7] focus:bg-white focus:ring-2 focus:ring-[#419FD7]/20"
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="mt-5 w-full rounded-xl bg-[#419FD7] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2f9dd4] disabled:opacity-50"
          >
            {loading ? '…' : isSignup ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </div>

        {/* Toggle */}
        <p className="mt-5 text-center text-sm text-[#a6a39b]">
          {isSignup ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
          <button
            type="button"
            onClick={() =>
              navigate({ to: '/login', search: { mode: isSignup ? 'login' : 'signup' } })
            }
            className="font-semibold text-[#419FD7] hover:underline"
          >
            {isSignup ? 'Se connecter' : "S'inscrire"}
          </button>
        </p>
      </div>
    </div>
  );
}
