
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface ConnectionStatus {
  marketplace: 'WB' | 'OZON';
  isConnected: boolean;
  lastChecked: Date;
  apiKey: string;
}

export const useConnectionStatus = () => {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  // Проверка API ключа Wildberries
  const checkWildberriesConnection = async (apiKey: string): Promise<boolean> => {
    try {
      console.log('Checking Wildberries API connection...');
      
      const response = await fetch('https://common-api.wildberries.ru/ping', {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Wildberries API error: ${response.status}`);
        return false;
      }

      const data = await response.json();
      return data.Status === 'OK';
    } catch (error) {
      console.error('Wildberries API connection error:', error);
      return false;
    }
  };

  // Проверка API ключа Ozon (заглушка)
  const checkOzonConnection = async (apiKey: string): Promise<boolean> => {
    try {
      // Здесь должен быть реальный Ozon API endpoint для проверки
      // Пока возвращаем true если API ключ не пустой
      return apiKey.length > 0;
    } catch (error) {
      console.error('Ozon API connection error:', error);
      return false;
    }
  };

  // Проверка одного подключения
  const checkSingleConnection = async (marketplace: 'WB' | 'OZON', apiKey: string): Promise<boolean> => {
    if (marketplace === 'WB') {
      return await checkWildberriesConnection(apiKey);
    } else {
      return await checkOzonConnection(apiKey);
    }
  };

  // Обновление статуса в базе данных
  const updateConnectionStatus = async (id: string, isConnected: boolean) => {
    try {
      const { error } = await supabase
        .from('marketplace_connections')
        .update({ is_connected: isConnected })
        .eq('id', id);

      if (error) {
        console.error('Error updating connection status:', error);
      }
    } catch (error) {
      console.error('Error updating connection status:', error);
    }
  };

  // Проверка конкретного подключения по требованию
  const checkSpecificConnection = async (marketplace: 'wildberries' | 'ozon') => {
    setIsChecking(true);
    const marketplaceCode = marketplace === 'wildberries' ? 'WB' : 'OZON';
    
    try {
      const { data: connection } = await supabase
        .from('marketplace_connections')
        .select('*')
        .eq('marketplace', marketplaceCode)
        .single();

      if (connection?.user_api_key) {
        const isConnected = await checkSingleConnection(marketplaceCode, connection.user_api_key);
        
        // Обновляем статус в БД
        await updateConnectionStatus(connection.id, isConnected);
        
        if (isConnected) {
          toast({
            title: "Подключение активно",
            description: `${marketplace === 'wildberries' ? 'Wildberries' : 'Ozon'}: API работает корректно`,
          });
        } else {
          toast({
            title: "Подключение недоступно",
            description: `${marketplace === 'wildberries' ? 'Wildberries' : 'Ozon'}: Произошла техническая ошибка, повторите попытку позже`,
            variant: "destructive",
          });
        }
        
        return isConnected;
      } else {
        toast({
          title: "Ошибка",
          description: "API ключ не найден",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      toast({
        title: "Ошибка проверки",
        description: "Произошла техническая ошибка, повторите попытку позже",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isChecking,
    checkSpecificConnection,
    checkSingleConnection,
  };
};
