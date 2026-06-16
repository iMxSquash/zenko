import { OnboardingRoleStep } from '@/components/onboarding/OnboardingRoleStep';
import { useUpdateRole } from '@/hooks/useProfile';
import type { ForumUserRole } from '@/types';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/_protected/onboarding/')({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<ForumUserRole | null>(null);
  const [doctolibUrl, setDoctolibUrl] = useState('');
  const [error, setError] = useState<string | undefined>();
  const updateRole = useUpdateRole();

  const handleSelectRole = (role: ForumUserRole) => {
    setSelectedRole(role);
    setError(undefined);
  };

  const handleContinue = () => {
    if (!selectedRole) return;

    setError(undefined);
    updateRole.mutate(
      {
        role: selectedRole,
        doctolibUrl: selectedRole === 'expert' ? doctolibUrl : undefined,
      },
      {
        onSuccess: () => navigate({ to: '/bibliotheque' }),
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
        },
      }
    );
  };

  return (
    <OnboardingRoleStep
      selectedRole={selectedRole}
      onSelectRole={handleSelectRole}
      doctolibUrl={doctolibUrl}
      onDoctolibUrlChange={setDoctolibUrl}
      error={error}
      isPending={updateRole.isPending}
      onBack={() => navigate({ to: '/' })}
      onContinue={handleContinue}
    />
  );
}
