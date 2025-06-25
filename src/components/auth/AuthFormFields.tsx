
import { Input } from '@/components/ui/input';
import { AuthMode } from '@/hooks/useAuthForm';

interface AuthFormFieldsProps {
  mode: AuthMode;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  fullName: string;
  setFullName: (value: string) => void;
}

export const AuthFormFields = ({
  mode,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  fullName,
  setFullName,
}: AuthFormFieldsProps) => {
  return (
    <>
      {mode === 'register' && (
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            Полное имя
          </label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Введите ваше полное имя"
            required
          />
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
      </div>
      
      {mode !== 'reset' && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Пароль
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            required
            minLength={6}
          />
        </div>
      )}

      {mode === 'register' && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Подтвердите пароль
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Повторите пароль"
            required
            minLength={6}
          />
        </div>
      )}
    </>
  );
};
