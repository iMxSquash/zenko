import { ZenkoLogo } from '@/components/ui/ZenkoLogo';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/legal/confidentialite')({
  component: ConfidentialitePage,
});

function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-8 py-5">
        <Link to="/">
          <ZenkoLogo width={110} />
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12 text-text-primary">
        <h1 className="mb-2 font-display text-3xl font-bold">Politique de confidentialité</h1>
        <p className="mb-10 text-sm text-text-muted">Dernière mise à jour : 18 juin 2026</p>

        <Section title="1. Responsable du traitement">
          <p>
            Zenko est édité par Alem Agency. Pour toute question relative à vos données
            personnelles, contactez-nous à :{' '}
            <a href="mailto:contact@zenko.fr" className="text-brand hover:underline">
              contact@zenko.fr
            </a>
            .
          </p>
        </Section>

        <Section title="2. Données collectées">
          <p>Nous collectons les données suivantes :</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-text-secondary">
            <li>
              <strong>Compte</strong> : adresse email, mot de passe (haché), prénom, nom, rôle
              (parent, enseignant, expert), avatar.
            </li>
            <li>
              <strong>Profil professionnel</strong> (optionnel) : liens LinkedIn, Instagram,
              Twitter, Doctolib.
            </li>
            <li>
              <strong>Conversations avec l'assistant IA</strong> : messages textuels et réponses de
              l'assistant. Ces données peuvent contenir des informations relatives à
              l'accompagnement d'un enfant neurodivergent (TSA, TDAH, DYS, TDI).
            </li>
            <li>
              <strong>Activité bibliothèque</strong> : fiches consultées, sauvegardées, progression
              de lecture.
            </li>
            <li>
              <strong>Forum</strong> : messages et discussions publics.
            </li>
            <li>
              <strong>Consentement</strong> : horodatage de l'acceptation des CGU et de la présente
              politique.
            </li>
          </ul>
        </Section>

        <Section title="3. Bases légales des traitements">
          <ul className="list-disc space-y-2 pl-5 text-text-secondary">
            <li>
              <strong>Exécution du contrat</strong> (art. 6.1.b RGPD) : gestion du compte, accès aux
              fiches et au forum.
            </li>
            <li>
              <strong>Consentement explicite</strong> (art. 9.2.a RGPD) : traitement des données
              relatives à l'accompagnement d'enfants neurodivergents dans l'assistant IA.
            </li>
            <li>
              <strong>Intérêt légitime</strong> (art. 6.1.f RGPD) : sécurité et amélioration du
              service, journaux d'erreurs anonymisés.
            </li>
          </ul>
        </Section>

        <Section title="4. Sous-traitants et transferts de données">
          <ul className="list-disc space-y-2 pl-5 text-text-secondary">
            <li>
              <strong>Supabase Inc.</strong> — hébergement de la base de données et
              authentification. Région : EU (Europe de l'Ouest). DPA disponible sur supabase.com.
            </li>
            <li>
              <strong>Google LLC (Gemini API)</strong> — traitement des messages de l'assistant IA
              pour générer des réponses. Les messages sont transmis aux serveurs Google. Google
              Cloud dispose d'un DPA conforme au RGPD et de clauses contractuelles types (SCC). Les
              données ne sont pas utilisées pour entraîner les modèles Google sans opt-in explicite.
            </li>
            <li>
              <strong>Vercel Inc.</strong> — hébergement de l'application web. Région : EU
              disponible. DPA disponible sur vercel.com.
            </li>
          </ul>
        </Section>

        <Section title="5. Durée de conservation">
          <ul className="list-disc space-y-1 pl-5 text-text-secondary">
            <li>Compte et profil : jusqu'à suppression du compte.</li>
            <li>
              Conversations assistant IA : <strong>12 mois</strong> à compter de la création de la
              session, puis suppression automatique.
            </li>
            <li>Messages forum : jusqu'à suppression du compte ou du message par l'auteur.</li>
            <li>
              Journaux de connexion (Supabase Auth) : 90 jours conformément à la politique Supabase.
            </li>
          </ul>
        </Section>

        <Section title="6. Vos droits">
          <p className="mb-3">
            Conformément au RGPD, vous disposez des droits suivants, exerçables à{' '}
            <a href="mailto:contact@zenko.fr" className="text-brand hover:underline">
              contact@zenko.fr
            </a>{' '}
            :
          </p>
          <ul className="list-disc space-y-1 pl-5 text-text-secondary">
            <li>
              <strong>Accès et portabilité</strong> : obtenir une copie de vos données (bouton
              "Télécharger mes données" dans les paramètres du profil).
            </li>
            <li>
              <strong>Rectification</strong> : modifier vos informations depuis votre profil.
            </li>
            <li>
              <strong>Effacement</strong> : supprimer votre compte et toutes vos données depuis les
              paramètres du profil.
            </li>
            <li>
              <strong>Retrait du consentement</strong> : vous pouvez retirer votre consentement à
              tout moment, sans effet sur les traitements antérieurs.
            </li>
            <li>
              <strong>Réclamation</strong> : introduire une réclamation auprès de la CNIL (cnil.fr).
            </li>
          </ul>
        </Section>

        <Section title="7. Mineurs">
          <p>
            Zenko est destiné aux adultes (parents, enseignants, professionnels de santé)
            accompagnant des enfants. Les utilisateurs de moins de 15 ans doivent disposer du
            consentement de leurs parents pour créer un compte, conformément à l'article 8 du RGPD
            et à la loi Informatique et Libertés.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            Zenko utilise uniquement des cookies strictement nécessaires au fonctionnement du
            service (authentification Supabase). Aucun cookie analytique ou publicitaire n'est
            utilisé.
          </p>
        </Section>

        <div className="mt-10 border-t border-border pt-6">
          <Link to="/" className="text-sm text-brand hover:underline">
            ← Retour à l'accueil
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
