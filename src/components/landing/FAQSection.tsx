import { SectionLabel } from '@/components/ui/SectionLabel';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const FAQ_ITEMS = [
  {
    question: `À qui s'adresse Zenko ?`,
    answer: `Zenko est conçu pour trois types d'utilisateurs : les parents d'enfants neurodivergents, les enseignants, et les spécialistes (orthophonistes, psychologues, AESH…). Chacun choisit son rôle à l'inscription et accède à une expérience adaptée à sa posture.`,
  },
  {
    question: 'Faut-il un diagnostic pour créer un compte ?',
    answer:
      'Non. Vous pouvez créer un compte et accéder à toutes les fonctionnalités sans diagnostic officiel. Zenko part du principe que les besoins existent avant les étiquettes.',
  },
  {
    question: 'La bibliothèque de fiches est-elle accessible sans compte ?',
    answer:
      'Oui. La bibliothèque est publique : vous pouvez parcourir et lire toutes les fiches pratiques (TSA, TDAH, DYS, TDI) sans vous inscrire. La création de compte débloque la progression de lecture et la mise en favoris.',
  },
  {
    question: 'Le forum est-il ouvert à tous ?',
    answer:
      'Les fils de discussion sont lisibles sans compte. Pour publier ou répondre, il faut être inscrit. Les échanges sont en temps réel, les nouvelles réponses apparaissent sans recharger la page.',
  },
  {
    question: `Comment fonctionne l'assistant IA ?`,
    answer: `L'assistant répond à vos questions sur les troubles neurodéveloppementaux, propose des stratégies d'adaptation et aide à formuler des situations difficiles. Il est accessible depuis la section Assistant après connexion. Toutes vos sessions sont sauvegardées et consultables dans l'historique.`,
  },
  {
    question: `L'assistant peut-il écouter ma voix ?`,
    answer: `Oui. L'assistant dispose d'une interface vocale : vous pouvez dicter votre question au lieu de la taper. Il peut aussi vous répondre à voix haute. Cette fonctionnalité utilise l'API Web Speech du navigateur, aucun audio n'est envoyé à un serveur tiers.`,
  },
  {
    question: 'La plateforme est-elle gratuite ?',
    answer:
      'Oui, Zenko est entièrement gratuit pendant la phase bêta. Un modèle freemium sera introduit ultérieurement, mais les fonctionnalités essentielles resteront accessibles sans abonnement.',
  },
  {
    question: 'Puis-je utiliser Zenko sur mon téléphone ?',
    answer: `Oui. Zenko est une Progressive Web App (PWA) : elle s'installe depuis le navigateur sur iOS et Android sans passer par un store. Elle fonctionne même hors connexion pour consulter les fiches et l'historique de vos sessions.`,
  },
  {
    question: 'Comment mes données personnelles sont-elles protégées ?',
    answer:
      'Les données sont stockées en Europe sur des serveurs certifiés RGPD (Supabase EU). Elles ne sont jamais vendues ni partagées avec des tiers. Vous pouvez supprimer votre compte et toutes vos données à tout moment depuis votre profil.',
  },
  {
    question: 'Est-ce que mes conversations entraînent des modèles IA ?',
    answer: `Non. Les échanges avec l'assistant ne sont pas utilisés pour entraîner des modèles. Les appels à l'IA transitent via des prestataires avec clause contractuelle de non-entraînement sur les données utilisateurs.`,
  },
] as const;

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section className="flex flex-col items-center bg-surface px-8 py-20 md:px-16">
      <div className="flex w-full max-w-3xl flex-col items-center gap-8">
        <SectionLabel color="var(--color-brand)">FAQ</SectionLabel>
        <h2 className="text-center text-[40px] font-bold leading-13 tracking-display text-dark md:text-display-md">
          Les questions qu&apos;on nous pose souvent.
        </h2>
        <ul className="w-full divide-y divide-border">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <li key={item.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-body-lg font-semibold text-text-primary">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'shrink-0 text-2xl text-brand transition-transform duration-200',
                      isOpen && 'rotate-45'
                    )}
                  >
                    +
                  </span>
                </button>
                <div
                  className={cn(
                    'overflow-hidden text-body-lg leading-7 text-text-secondary transition-all duration-200',
                    isOpen ? 'max-h-150 pb-5 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  {item.answer}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
