import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { Link } from '@tanstack/react-router';

export function LandingFooter() {
  return (
    <footer className="bg-dark px-8 py-16 text-white md:px-16">
      <div className="mb-10 flex flex-col gap-10 lg:flex-row lg:gap-20">
        {/* Brand */}
        <div className="flex flex-1 flex-col gap-4">
          <p className="text-sm font-medium opacity-70">Même enfant. Mêmes mots.</p>
          <p className="text-[13px] leading-5 opacity-60">
            Une plateforme pour faire dialoguer l&apos;école, la famille et les spécialistes autour
            de l&apos;enfant neurodivergent.
          </p>
          <ZenkoLogo width={110} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
        <p className="text-label opacity-50">
          © 2026 ZENKO - Conçu par Alem Agency. L&apos;humain d&apos;abord.
        </p>
        <div className="flex gap-4 text-label opacity-50">
          <Link to="/legal/mentions-legales" className="hover:opacity-100 hover:underline">
            Mentions légales
          </Link>
          <span aria-hidden="true">•</span>
          <Link to="/legal/confidentialite" className="hover:opacity-100 hover:underline">
            RGPD
          </Link>
          <span aria-hidden="true">•</span>
          <Link to="/legal/cgu" className="hover:opacity-100 hover:underline">
            CGU
          </Link>
        </div>
      </div>
    </footer>
  );
}
