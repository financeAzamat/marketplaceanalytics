
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface ConnectionStatus {
  marketplace: 'WB' | 'OZON';
  isConnected: boolean;
  lastChecked: Date;
  apiKey: string;
}

export const useConnectionStatus = () => {
  const [statuses, setStatuses] = useState<ConnectionStatus[]>([]);
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

  // Проверка API ключа Ozon (заглушка - нужен реальный endpoint)
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

  // Проверка всех активных подключений
  const checkAllConnections = useCallback(async () => {
    setIsChecking(true);
    
    try {
      // Получаем все подключения с API ключами
      const { data: connections, error } = await supabase
        .from('marketplace_connections')
        .select('*')
        .not('user_api_key', 'is', null);

      if (error) {
        console.error('Error fetching connections:', error);
        return;
      }

      const newStatuses: ConnectionStatus[] = [];
      let hasChanges = false;

      for (const connection of connections || []) {
        const isConnected = await checkSingleConnection(
          connection.marketplace as 'WB' | 'OZON',
          connection.user_api_key
        );

        // Обновляем статус в БД если изменился
        if (connection.is_connected !== isConnected) {
          await updateConnectionStatus(connection.id, isConnected);
          hasChanges = true;
          
          // Показываем уведомление при изменении статуса
          const marketplaceName = connection.marketplace === 'WB' ? 'Wildberries' : 'Ozon';
          toast({
            title: isConnected ? "Подключение восстановлено" : "Подключение потеряно",
            description: `${marketplaceName}: ${isConnected ? 'API работает корректно' : 'API недоступен'}`,
            variant: isConnected ? "default" : "destructive",
          });
        }

        newStatuses.push({
          marketplace: connection.marketplace as 'WB' | 'OZON',
          isConnected,
          lastChecked: new Date(),
          apiKey: connection.user_api_key,
        });
      }

      setStatuses(newStatuses);

      // Если были изменения, обновляем кэш React Query
      if (hasChanges) {
        // Здесь можно инвалидировать кэш, если нужно
      }

    } catch (error) {
      console.error('Error checking connections:', error);
    } finally {
      setIsChecking(false);
    }
  }, [toast]);

  // Автоматическая проверка каждые 5 минут
  useEffect(() => {
    // Проверяем сразу при загрузке
    checkAllConnections();

    // Устанавливаем интервал для периодической проверки
    const interval = setInterval(checkAllConnections, 5 * 60 * 1000); // 5 минут

    return () => clearInterval(interval);
  }, [checkAllConnections]);

  // Проверка конкретного подключения по требованию
  const checkSpecificConnection = async (marketplace: 'wildberries' | 'ozon') => {
    const marketplaceCode = marketplace === 'wildberries' ? 'WB' : 'OZON';
    
    const { data: connection } = await supabase
      .from('marketplace_connections')
      .select('*')
      .eq('marketplace', marketplaceCode)
      .eq('is_connected', true)
      .single();

    if (connection?.user_api_key) {
      const isConnected = await checkSingleConnection(marketplaceCode, connection.user_api_key);
      
      if (connection.is_connected !== isConnected) {
        await updateConnectionStatus(connection.id, isConnected);
      }
      
      return isConnected;
    }
    
    return false;
  };

  return {
    statuses,
    isChecking,
    checkAllConnections,
    checkSpecificConnection,
    checkSingleConnection,
  };
};
