import { ZenkoLogo } from '@/components/ui/ZenkoLogo';

const FOOTER_LINKS = {
  PRODUIT: [
    'Comment ça marche',
    'Pour les enseignants',
    'Pour les parents',
    'Pour les spécialistes',
  ],
  RESSOURCES: ['Blog', "Centre d'aide", 'API'],
  AGENCE: ['À propos', 'Notre approche', 'Contact'],
} as const;

export function LandingFooter() {
  return (
    <footer className="bg-dark px-8 py-16 text-white md:px-16">
      <div className="mb-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium opacity-70">Même enfant. Mêmes mots.</p>
          <p className="text-[13px] leading-5 opacity-60">
            Une plateforme pour faire dialoguer l&apos;école, la famille et les spécialistes autour
            de l&apos;enfant neurodivergent.
          </p>
          <ZenkoLogo width={110} className="opacity-80 brightness-0 invert" />
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([section, links]) => (
          <div key={section} className="flex flex-col gap-3">
            <p className="text-label font-semibold tracking-label opacity-50">{section}</p>
            {links.map((l) => (
              <p key={l} className="text-body-sm font-medium opacity-85">
                {l}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
        <p className="text-[12px] opacity-50">
          © 2026 ZENKO — Conçu par Alem Agency. L&apos;humain d&apos;abord.
        </p>
        <p className="text-[12px] opacity-50">Mentions légales • RGPD • Cookies</p>
      </div>
    </footer>
  );
}
