
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMarketplaceConnections = () => {
  const { data: connections, isLoading } = useQuery({
    queryKey: ['marketplace-connections-all'],
    queryFn: async () => {
      // Получаем все подключения без фильтрации по пользователю
      const { data, error } = await supabase
        .from('marketplace_connections')
        .select('*');

      if (error) {
        console.error('Error fetching connections:', error);
        return [];
      }
      return data || [];
    },
  });

  const getConnectionStatus = (marketplace: 'wildberries' | 'ozon') => {
    const marketplaceCode = marketplace === 'wildberries' ? 'WB' : 'OZON';
    const connection = connections?.find(c => c.marketplace === marketplaceCode && c.is_connected);
    return connection?.is_connected || false;
  };

  return {
    connections,
    isLoading,
    getConnectionStatus,
  };
};
