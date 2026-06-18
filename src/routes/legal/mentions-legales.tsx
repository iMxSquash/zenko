import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/legal/mentions-legales')({
  component: MentionsLegalesPage,
});

function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-8 py-5">
        <Link to="/">
          <ZenkoLogo width={110} />
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12 text-text-primary">
        <h1 className="mb-2 font-display text-3xl font-bold">Mentions légales</h1>
        <p className="mb-10 text-sm text-text-muted">Dernière mise à jour : 18 juin 2026</p>

        <Section title="Éditeur du site">
          <ul className="list-none space-y-1 text-text-secondary">
            <li>
              <strong>Dénomination</strong> : Alem Agency
            </li>
            <li>
              <strong>Forme juridique</strong> : à compléter
            </li>
            <li>
              <strong>Siège social</strong> : à compléter
            </li>
            <li>
              <strong>SIRET</strong> : à compléter
            </li>
            <li>
              <strong>Email</strong> :{' '}
              <a href="mailto:contact@zenko.fr" className="text-brand hover:underline">
                contact@zenko.fr
              </a>
            </li>
            <li>
              <strong>Directeur de la publication</strong> : à compléter
            </li>
          </ul>
        </Section>

        <Section title="Hébergement">
          <ul className="list-none space-y-1 text-text-secondary">
            <li>
              <strong>Frontend</strong> : Vercel Inc. — 340 Pine Street, Suite 1702, San Francisco,
              CA 94104, États-Unis. vercel.com
            </li>
            <li>
              <strong>Base de données & authentification</strong> : Supabase Inc. — 970 Toa Payoh
              North #07-04, Singapore 318992. supabase.com — Données hébergées en région EU.
            </li>
          </ul>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>
            L'ensemble des contenus présents sur Zenko (textes, images, fiches pratiques, logo,
            charte graphique) est protégé par le droit d'auteur et est la propriété exclusive d'Alem
            Agency, sauf mention contraire. Toute reproduction, représentation, modification,
            publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen
            ou le procédé utilisé, est interdite sauf autorisation écrite préalable.
          </p>
        </Section>

        <Section title="Données personnelles">
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
            Informatique et Libertés, vous disposez de droits sur vos données personnelles.
            Consultez notre{' '}
            <Link to="/legal/confidentialite" className="text-brand hover:underline">
              politique de confidentialité
            </Link>{' '}
            pour en savoir plus.
          </p>
          <p className="mt-3">
            Autorité de contrôle compétente :{' '}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              Commission Nationale de l'Informatique et des Libertés (CNIL)
            </a>
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Zenko utilise uniquement des cookies strictement nécessaires au fonctionnement du
            service (session d'authentification). Aucun cookie publicitaire ou analytique n'est
            déposé sans votre consentement.
          </p>
        </Section>

        <Section title="Médiation">
          <p>
            Conformément aux dispositions du Code de la consommation relatives au règlement amiable
            des litiges, Zenko adhère au service du médiateur disponible à l'adresse suivante : à
            compléter.
          </p>
        </Section>

        <div className="mt-10 border-t border-border pt-6 flex gap-6">
          <Link to="/legal/confidentialite" className="text-sm text-brand hover:underline">
            Politique de confidentialité
          </Link>
          <Link to="/legal/cgu" className="text-sm text-brand hover:underline">
            CGU
          </Link>
          <Link to="/" className="text-sm text-text-muted hover:underline">
            ← Accueil
          </Link>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">{title}</h2>
      <div className="leading-7 text-text-secondary">{children}</div>
    </section>
  );
}
