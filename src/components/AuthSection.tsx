
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from './AuthForm';

interface AuthSectionProps {
  onAuth: () => void;
}

export const AuthSection = ({ onAuth }: AuthSectionProps) => {
  const { user, loading } = useAuth();

  // If user is authenticated, call onAuth callback
  if (user && !loading) {
    onAuth();
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Show auth form
  return <AuthForm />;
};
