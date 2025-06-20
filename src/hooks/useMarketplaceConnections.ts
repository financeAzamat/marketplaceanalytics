
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useMarketplaceConnections = () => {
  const { user } = useAuth();

  const { data: connections, isLoading } = useQuery({
    queryKey: ['marketplace-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('marketplace_connections')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const getConnectionStatus = (marketplace: 'wildberries' | 'ozon') => {
    const marketplaceCode = marketplace === 'wildberries' ? 'WB' : 'OZON';
    const connection = connections?.find(c => c.marketplace === marketplaceCode);
    return connection?.is_connected || false;
  };

  return {
    connections,
    isLoading,
    getConnectionStatus,
  };
};
