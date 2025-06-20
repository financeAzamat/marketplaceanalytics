
import { useState } from 'react';
import { useToast } from './use-toast';

// Простой хук для MVP без Supabase
export const useProfile = () => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Имитируем профиль из localStorage
  const profile = {
    id: 'demo-user',
    full_name: localStorage.getItem('fullName') || '',
    company_name: localStorage.getItem('companyName') || '',
    email: localStorage.getItem('email') || 'demo@example.com',
  };

  const updateProfile = async (updates: { full_name?: string; company_name?: string }) => {
    setIsUpdating(true);
    try {
      if (updates.full_name !== undefined) {
        localStorage.setItem('fullName', updates.full_name);
      }
      if (updates.company_name !== undefined) {
        localStorage.setItem('companyName', updates.company_name);
      }

      toast({
        title: "Профиль обновлен",
        description: "Данные успешно сохранены",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    profile,
    isLoading: false,
    updateProfile,
    isUpdating,
  };
};
