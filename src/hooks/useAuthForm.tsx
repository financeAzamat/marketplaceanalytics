
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export type AuthMode = 'login' | 'register' | 'reset';

export const useAuthForm = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const resetPassword = async (email: string) => {
    // Mock функция восстановления пароля
    return new Promise<{ error: null }>((resolve) => {
      setTimeout(() => {
        resolve({ error: null });
      }, 1000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        toast({
          title: "Добро пожаловать!",
          description: "Вы успешно вошли в систему.",
        });
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Пароли не совпадают');
        }
        if (password.length < 6) {
          throw new Error('Пароль должен содержать минимум 6 символов');
        }
        
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        
        toast({
          title: "Регистрация успешна!",
          description: "Проверьте email для подтверждения аккаунта.",
        });
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        
        toast({
          title: "Ссылка отправлена!",
          description: "Проверьте email для восстановления пароля.",
        });
        setMode('login');
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Произошла ошибка при аутентификации",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    loading,
    handleSubmit,
  };
};
