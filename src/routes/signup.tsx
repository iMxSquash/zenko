import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { signUpWithPassword } from '@/lib/supabase/auth';
import { Link, createFileRoute } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { useState } from 'react';

export const Route = createFileRoute('/signup')({
  component: SignupPage,
});

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUpWithPassword(email, password);
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Impossible de créer le compte';
      setError(
        msg === 'User already registered'
          ? 'Un compte existe déjà avec cet email'
          : msg.startsWith('Password should be at least')
            ? 'Le mot de passe doit contenir au moins 6 caractères'
            : msg
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div
          className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-surface p-10 text-center"
          style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)' }}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl">
            ✉️
          </div>
          <div className="space-y-2">
            <h1
              className="font-display font-bold text-text-primary"
              style={{ fontSize: 'var(--text-h3)' }}
            >
              Vérifiez votre email
            </h1>
            <p className="text-text-secondary" style={{ fontSize: 'var(--text-body-sm)' }}>
              Un lien de confirmation vous a été envoyé. Cliquez dessus pour activer votre compte.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-block font-semibold text-brand-green hover:underline"
            style={{ fontSize: 'var(--text-body-sm)' }}
          >
            ← Retour à la connexion
          </Link>
        </div>
      </main>
    );
  }

  const isFormFilled = !!email && !!password && !!confirmation;

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-white">
      {/* Logo absolu en haut à gauche */}
      <div className="absolute left-16 top-16 z-20 hidden lg:block">
        <ZenkoLogo width={145} />
      </div>

      {/* Blob bottom-right — positionné sur <main> pour éviter le clip */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute hidden select-none lg:block"
        style={{
          left: '36vw',
          bottom: '20.6vh',
          width: '10vw',
          height: '8.9vw',
          zIndex: 10,
        }}
      >
        <div className="absolute" style={{ inset: '-7.21% -6.79%' }}>
          <motion.img
            src="/assets/signup_blob_23.svg"
            alt=""
            aria-hidden="true"
            className="block size-full max-w-none"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Blob top-right — chevauche les 2 panneaux, positionné sur <main> */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute hidden select-none lg:block"
        style={{
          left: '39.05vw',
          top: '-6.77vw',
          width: '16.67vw',
          height: '15.56vw',
          transform: 'rotate(-7.39deg)',
          transformOrigin: 'top left',
          zIndex: 10,
        }}
      >
        <motion.img
          src="/assets/signup_blob_25.svg"
          alt=""
          aria-hidden="true"
          className="block w-full h-full"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
            delay: 1.2,
          }}
        />
      </div>

      {/* ── Panneau gauche — branding (697/1440 = ~48%) ── */}
      <div className="relative hidden lg:flex lg:w-[48.4%] flex-col items-center justify-center overflow-hidden bg-neutral-50">
        {/* Blob top-center — grand flou (Vector24) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute select-none"
          style={{ left: 349, top: 89, width: 192, height: 208 }}
        >
          <div className="absolute" style={{ inset: '-5.59% -5.82%' }}>
            <motion.img
              src="/assets/signup_blob_24.svg"
              alt=""
              aria-hidden="true"
              className="block size-full max-w-none"
              animate={{ x: [0, 6, 0], y: [0, -8, 0] }}
              transition={{
                duration: 9,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
                delay: 0.6,
              }}
            />
          </div>
        </div>

        {/* Blob left-center — avec overflow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute select-none"
          style={{ left: 19, top: 250, width: 128, height: 144 }}
        >
          <div className="absolute" style={{ inset: '-19.79% -20.51%' }}>
            <motion.img
              src="/assets/signup_blob_20.svg"
              alt=""
              aria-hidden="true"
              className="block size-full max-w-none"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
                delay: 1.8,
              }}
            />
          </div>
        </div>

        {/* Blob bottom-left — grand, ancré en bas */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute select-none"
          style={{ left: -165, bottom: -109, width: 384, height: 384 }}
        >
          <motion.img
            src="/assets/signup_blob_22.svg"
            alt=""
            aria-hidden="true"
            className="block w-full h-full"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              delay: 0.3,
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
            Rejoignez
            <br />
            <span className="text-brand-green">l&apos;aventure !</span>
          </h2>
          <p
            className="text-text-muted"
            style={{ fontSize: 'var(--text-body-sm)', lineHeight: '20px' }}
          >
            Créez votre compte et accédez à toutes vos ressources en quelques secondes.
          </p>
        </div>
      </div>

      {/* ── Panneau droit — formulaire (743/1440 = ~51.6%) ── */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden p-3 lg:w-[51.6%]">
        {/* Mobile logo */}
        <div className="mb-10 self-start pl-4 lg:hidden">
          <ZenkoLogo width={120} />
        </div>

        {/* Card */}
        <div className="rounded-[32px] bg-emerald-100/10 p-8">
          <div className="flex w-full flex-col gap-8 lg:w-96">
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
                Créer un compte
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
                    EMAIL<span className="text-danger">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="mail@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-stone-50 p-3 text-text-primary outline outline-1 outline-offset-[-1px] outline-border-default transition-all focus:outline-brand-green"
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
                    MOT DE PASSE<span className="text-danger">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl bg-stone-50 p-3 text-text-primary outline outline-1 outline-offset-[-1px] outline-border-default transition-all focus:outline-brand-green"
                    style={{ fontSize: 'var(--text-body-sm)' }}
                  />
                </div>

                {/* Confirmer */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="confirmation"
                    className="font-bold text-text-secondary"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      lineHeight: '24px',
                    }}
                  >
                    CONFIRMER LE MOT DE PASSE<span className="text-danger">*</span>
                  </label>
                  <input
                    id="confirmation"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••••••••"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    className="w-full rounded-xl bg-stone-50 p-3 text-text-primary outline outline-1 outline-offset-[-1px] outline-border-default transition-all focus:outline-brand-green"
                    style={{ fontSize: 'var(--text-body-sm)' }}
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={loading || !isFormFilled}
                    className={
                      isFormFilled && !loading
                        ? 'w-full rounded-full bg-brand-green px-6 py-4 font-display font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99]'
                        : 'w-full rounded-full px-6 py-4 font-display font-semibold text-text-muted outline outline-1 outline-offset-[-1px] outline-border-default transition-all'
                    }
                    style={{ fontSize: 'var(--text-button)', lineHeight: '16px' }}
                  >
                    {loading ? '…' : 'Créer mon compte'}
                  </button>

                  <p
                    className="text-center text-text-secondary"
                    style={{ fontSize: 'var(--text-body-sm)', lineHeight: '20px' }}
                  >
                    Déjà un compte ?{' '}
                    <Link to="/login" className="font-bold text-brand hover:underline">
                      Se connecter
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
