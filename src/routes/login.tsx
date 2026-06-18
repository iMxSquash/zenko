import { SEOHead } from '@/components/seo/SEOHead';
import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { getProfile } from '@/lib/profile/profile';
import { signInWithPassword } from '@/lib/supabase/auth';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'motion/react';
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
  const isSignup = mode === 'signup';
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user } = await signInWithPassword(email, password);
      const profile = user ? await getProfile(user.id) : null;
      navigate({ to: profile?.role ? '/bibliotheque' : '/onboarding' });
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
      <div className="absolute left-16 top-16 z-20 hidden lg:block">
        <ZenkoLogo width={145} />
      </div>

      {/* Blob 22 — top, brand, positionné sur <main> */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute hidden select-none lg:block"
        style={{
          left: '34.2vw',
          top: '-5.35vw',
          width: '11.11vw',
          height: '11.11vw',
          zIndex: 10,
        }}
      >
        <div className="relative size-full">
          <motion.img
            src="/assets/blob_22.svg"
            alt=""
            aria-hidden="true"
            className="absolute block inset-0 max-w-none size-full"
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Blob 23 — chevauche les 2 panneaux, positionné sur <main> */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute hidden select-none lg:block"
        style={{
          left: '37.7vw',
          bottom: '-10.76vw',
          width: '17.78vw',
          height: '20vw',
          zIndex: 10,
          position: 'absolute',
        }}
      >
        <div className="relative size-full">
          <motion.img
            src="/assets/blob_23.svg"
            alt=""
            aria-hidden="true"
            className="absolute block inset-0 max-w-none size-full"
            animate={{ y: [0, 12, 0] }}
            transition={{
              duration: 7,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              delay: 1.5,
            }}
          />
        </div>
      </div>

      {/* ── Panneau gauche — branding (697/1440 = ~48%) ── */}
      <div className="relative hidden lg:flex lg:w-[48.4%] flex-col items-center justify-center overflow-hidden bg-neutral-50">
        {/* Blob 24 — left-center */}
        <motion.img
          src="/assets/blob_24.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute select-none"
          style={{ left: -104, top: 188, width: 207, height: 215 }}
          animate={{ x: [0, 8, 0], y: [0, -6, 0] }}
          transition={{
            duration: 9,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
            delay: 0.8,
          }}
        />

        {/* Blob 25 — center, blurred */}
        <div
          className="pointer-events-none absolute select-none"
          style={{ left: 440, top: 242, width: 103, height: 107 }}
        >
          <motion.img
            src="/assets/blob_25.svg"
            alt=""
            aria-hidden="true"
            className="absolute block max-w-none size-full"
            style={{ inset: '-15.98% -16.6%' }}
            animate={{ rotate: [0, 8, 0] }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
        </div>

        {/* Blob 26 — bottom-center, ancré en bas */}
        <div
          className="pointer-events-none absolute select-none"
          style={{ left: 186, bottom: 110, width: 163, height: 154 }}
        >
          <motion.img
            src="/assets/blob_26.svg"
            alt=""
            aria-hidden="true"
            className="absolute block max-w-none size-full"
            style={{ inset: '-6.43% -6.07%' }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              delay: 0.4,
            }}
          />
        </div>

        {/* Texte central */}
        <div className="relative z-10 flex flex-col gap-2.5" style={{ width: 388 }}>
          <h2
            className="font-bold text-black"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '56px',
              lineHeight: '64px',
              letterSpacing: '-0.84px',
            }}
          >
            Ravie de vous
            <br />
            <span className="text-brand">revoir !</span>
          </h2>
          <p
            className="text-text-muted"
            style={{ fontSize: 'var(--text-body-sm)', lineHeight: '20px' }}
          >
            Connectez-vous pour accéder à votre espace et retrouver vos ressources
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
