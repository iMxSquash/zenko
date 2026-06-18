import { CTABanner } from '@/components/landing/CTABanner';
import { FAQSection } from '@/components/landing/FAQSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNav } from '@/components/landing/LandingNav';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { SEOHead } from '@/components/seo/SEOHead';
import { SmoothScrollProvider } from '@/lib/scroll/SmoothScrollProvider';
import { useSectionSnap } from '@/lib/scroll/useSectionSnap';
import { generateOrganizationJsonLd, generateWebSiteJsonLd, useJsonLd } from '@/lib/seo/jsonld';
import { siteConfig } from '@/lib/seo/site';
import { createFileRoute } from '@tanstack/react-router';
import { useRef } from 'react';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  useJsonLd(generateOrganizationJsonLd(), 'organization-jsonld');
  useJsonLd(generateWebSiteJsonLd(), 'website-jsonld');

  return (
    <SmoothScrollProvider>
      <LandingSections />
    </SmoothScrollProvider>
  );
}

function LandingSections() {
  const containerRef = useRef<HTMLDivElement>(null);
  useSectionSnap(containerRef);

  return (
    <div ref={containerRef} className="overflow-x-hidden bg-surface">
      <SEOHead
        title="Accompagner les enfants neurodivergents, ensemble"
        description={siteConfig.description}
        path="/"
      />
      <div data-snap-section>
        <LandingNav />
        <HeroSection />
      </div>
      <ProblemSection />
      <SolutionSection />
      <TestimonialsSection />
      <FAQSection />
      <CTABanner />
      <LandingFooter />
    </div>
  );
}
