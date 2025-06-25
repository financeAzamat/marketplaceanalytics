
import { AuthMode } from '@/hooks/useAuthForm';

export const getTitle = (mode: AuthMode): string => {
  switch (mode) {
    case 'login': return 'Вход в систему';
    case 'register': return 'Регистрация';
    case 'reset': return 'Восстановление пароля';
  }
};

export const getDescription = (mode: AuthMode): string => {
  switch (mode) {
    case 'login': return 'Войдите в ваш аккаунт MarketPlace Analytics';
    case 'register': return 'Создайте новый аккаунт для начала работы';
    case 'reset': return 'Введите email для получения ссылки восстановления';
  }
};

export const getSubmitText = (mode: AuthMode): string => {
  switch (mode) {
    case 'login': return 'Войти';
    case 'register': return 'Зарегистрироваться';
    case 'reset': return 'Отправить ссылку';
  }
};
