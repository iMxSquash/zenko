import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/legal/cgu')({
  component: CguPage,
});

function CguPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-8 py-5">
        <Link to="/">
          <ZenkoLogo width={110} />
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12 text-text-primary">
        <h1 className="mb-2 font-display text-3xl font-bold">Conditions Générales d'Utilisation</h1>
        <p className="mb-10 text-sm text-text-muted">Dernière mise à jour : 18 juin 2026</p>

        <Section title="1. Objet">
          <p>
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et
            l'utilisation de la plateforme Zenko, éditée par Alem Agency, accessible à l'adresse
            zenko.fr. En créant un compte, vous acceptez sans réserve les présentes CGU.
          </p>
        </Section>

        <Section title="2. Description du service">
          <p>
            Zenko est une plateforme destinée à faciliter l'accompagnement des enfants
            neurodivergents (TSA, TDAH, DYS, TDI) en mettant en relation parents, enseignants et
            professionnels de santé. Le service comprend :
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Une bibliothèque de fiches pratiques.</li>
            <li>Un forum d'échange entre utilisateurs.</li>
            <li>Un assistant IA pour répondre aux questions relatives à la neurodivergence.</li>
          </ul>
        </Section>

        <Section title="3. Accès et inscription">
          <p>
            L'accès au service est réservé aux personnes physiques majeures ou aux mineurs disposant
            du consentement de leurs représentants légaux. Vous vous engagez à fournir des
            informations exactes lors de l'inscription et à maintenir la confidentialité de votre
            mot de passe.
          </p>
        </Section>

        <Section title="4. Rôles et vérification">
          <p>
            Lors de l'inscription, vous choisissez un rôle (parent, enseignant, expert). Le rôle
            "expert" nécessite la fourniture d'un lien Doctolib attestant d'une pratique
            professionnelle. Zenko se réserve le droit de suspendre tout compte dont le rôle déclaré
            ne correspond pas à la réalité.
          </p>
        </Section>

        <Section title="5. Contenu utilisateur">
          <p>
            Vous êtes responsable des contenus que vous publiez sur le forum. Il est strictement
            interdit de :
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              Publier des diagnostics médicaux ou des conseils thérapeutiques sans habilitation.
            </li>
            <li>Usurper l'identité d'un professionnel de santé.</li>
            <li>
              Diffuser des contenus illicites, diffamatoires ou portant atteinte à la vie privée.
            </li>
            <li>Partager des données personnelles d'enfants (nom, photo, dossier médical).</li>
          </ul>
        </Section>

        <Section title="6. Assistant IA - avertissement">
          <p>
            L'assistant IA de Zenko fournit des informations générales basées sur les fiches et
            discussions de la plateforme. Il ne remplace en aucun cas l'avis d'un professionnel de
            santé qualifié. Zenko décline toute responsabilité quant à l'utilisation des réponses de
            l'assistant à des fins médicales ou thérapeutiques.
          </p>
        </Section>

        <Section title="7. Propriété intellectuelle">
          <p>
            Les fiches pratiques et le contenu éditorial de Zenko sont protégés par le droit
            d'auteur. Toute reproduction sans autorisation écrite est interdite. Les contenus
            publiés par les utilisateurs restent leur propriété, mais ils accordent à Zenko une
            licence non exclusive d'utilisation pour le fonctionnement du service.
          </p>
        </Section>

        <Section title="8. Suspension et résiliation">
          <p>
            Zenko se réserve le droit de suspendre ou supprimer tout compte en cas de violation des
            présentes CGU, sans préavis ni remboursement. L'utilisateur peut supprimer son compte à
            tout moment depuis les paramètres de son profil.
          </p>
        </Section>

        <Section title="9. Limitation de responsabilité">
          <p>
            Zenko est fourni "en l'état". Nous ne garantissons pas l'exactitude, l'exhaustivité ou
            l'adéquation des informations disponibles sur la plateforme à une situation médicale
            particulière. Notre responsabilité est limitée aux dommages directs prouvés résultant
            d'une faute de notre part.
          </p>
        </Section>

        <Section title="10. Droit applicable">
          <p>
            Les présentes CGU sont soumises au droit français. Tout litige sera soumis aux tribunaux
            compétents du ressort du siège social d'Alem Agency.
          </p>
        </Section>

        <div className="mt-10 border-t border-border pt-6 flex gap-6">
          <Link to="/legal/confidentialite" className="text-sm text-brand hover:underline">
            Politique de confidentialité
          </Link>
          <Link to="/legal/mentions-legales" className="text-sm text-brand hover:underline">
            Mentions légales
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
