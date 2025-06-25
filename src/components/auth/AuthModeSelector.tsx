
import { Button } from '@/components/ui/button';
import { AuthMode } from '@/hooks/useAuthForm';

interface AuthModeSelectorProps {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
}

export const AuthModeSelector = ({ mode, setMode }: AuthModeSelectorProps) => {
  return (
    <div className="mt-4 space-y-2 text-center">
      {mode === 'login' && (
        <>
          <Button
            variant="link"
            onClick={() => setMode('register')}
            className="text-sm"
          >
            Нет аккаунта? Зарегистрируйтесь
          </Button>
          <br />
          <Button
            variant="link"
            onClick={() => setMode('reset')}
            className="text-sm text-gray-600"
          >
            Забыли пароль?
          </Button>
        </>
      )}
      
      {mode === 'register' && (
        <Button
          variant="link"
          onClick={() => setMode('login')}
          className="text-sm"
        >
          Уже есть аккаунт? Войдите
        </Button>
      )}
      
      {mode === 'reset' && (
        <Button
          variant="link"
          onClick={() => setMode('login')}
          className="text-sm"
        >
          Вернуться ко входу
        </Button>
      )}
    </div>
  );
};
