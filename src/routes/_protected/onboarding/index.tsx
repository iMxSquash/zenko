import { OnboardingNav } from '@/components/onboarding/OnboardingNav';
import { OnboardingRoleStep } from '@/components/onboarding/OnboardingRoleStep';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/_protected/onboarding/')({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <OnboardingNav />
      <OnboardingRoleStep
        selectedRole={selectedRole}
        onSelect={setSelectedRole}
        onBack={() => navigate({ to: '/' })}
        onContinue={() => navigate({ to: '/app' })}
      />
    </div>
  );
}
