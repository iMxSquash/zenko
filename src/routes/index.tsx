import { CTABanner } from '@/components/landing/CTABanner';
import { HeroSection } from '@/components/landing/HeroSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNav } from '@/components/landing/LandingNav';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-surface">
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
