
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'reset';

export const AuthForm = () => {
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
    return new Promise((resolve) => {
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

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Вход в систему';
      case 'register': return 'Регистрация';
      case 'reset': return 'Восстановление пароля';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login': return 'Войдите в ваш аккаунт MarketPlace Analytics';
      case 'register': return 'Создайте новый аккаунт для начала работы';
      case 'reset': return 'Введите email для получения ссылки восстановления';
    }
  };

  const getSubmitText = () => {
    switch (mode) {
      case 'login': return 'Войти';
      case 'register': return 'Зарегистрироваться';
      case 'reset': return 'Отправить ссылку';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            {mode === 'reset' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('login')}
                className="absolute left-4 top-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {getTitle()}
          </CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getSubmitText()}
            </Button>
          </form>
          
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
        </CardContent>
      </Card>
    </div>
  );
};
