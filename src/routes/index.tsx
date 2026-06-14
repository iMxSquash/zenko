import { CTABanner } from '@/components/landing/CTABanner';
import { HeroSection } from '@/components/landing/HeroSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNav } from '@/components/landing/LandingNav';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { SEOHead } from '@/components/seo/SEOHead';
import { generateOrganizationJsonLd, generateWebSiteJsonLd, useJsonLd } from '@/lib/seo/jsonld';
import { siteConfig } from '@/lib/seo/site';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  useJsonLd(generateOrganizationJsonLd(), 'organization-jsonld');
  useJsonLd(generateWebSiteJsonLd(), 'website-jsonld');

  return (
    <div className="overflow-x-hidden bg-surface">
      <SEOHead
        title="Accompagner les enfants neurodivergents, ensemble"
        description={siteConfig.description}
        path="/"
      />
      <LandingNav />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <TestimonialsSection />
      <CTABanner />
      <LandingFooter />
    </div>
  );
}
