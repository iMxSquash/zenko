import { Forum } from '@/components/forum/Forum';
import { SEOHead } from '@/components/seo/SEOHead';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/forum/')({
  component: ForumPage,
});

function ForumPage() {
  return (
    <>
      <SEOHead
        title="Forum d'entraide"
        description="Échangez avec des enseignants, des parents et des spécialistes autour de l'accompagnement des enfants neurodivergents."
        path="/forum"
      />
      <Forum />
    </>
  );
}
