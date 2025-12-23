import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

interface OnboardingGuardProps {
  children: ReactNode;
}

const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const { isOnboarded } = useUser();

  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default OnboardingGuard;
