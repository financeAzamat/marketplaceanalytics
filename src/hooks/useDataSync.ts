
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface SyncStatus {
  marketplace: 'wildberries' | 'ozon';
  lastSync: string | null;
  isConnected: boolean;
  syncInProgress: boolean;
}

export const useDataSync = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncProgress, setSyncProgress] = useState<{ [key: string]: number }>({});

  const { data: syncStatuses, isLoading } = useQuery({
    queryKey: ['sync-statuses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('marketplace_connections')
        .select('marketplace, last_sync_at, is_connected')
        .eq('user_id', user.id);

      if (error) throw error;
      
      return data.map(conn => ({
        marketplace: conn.marketplace as 'wildberries' | 'ozon',
        lastSync: conn.last_sync_at,
        isConnected: conn.is_connected,
        syncInProgress: false,
      }));
    },
    enabled: !!user?.id,
  });

  const syncMarketplaceMutation = useMutation({
    mutationFn: async (marketplace: 'wildberries' | 'ozon') => {
      if (!user?.id) throw new Error('User not authenticated');
      
      console.log('Starting sync for marketplace:', marketplace, 'User ID:', user.id);
      
      // Simulate real API sync with progress updates
      setSyncProgress(prev => ({ ...prev, [marketplace]: 0 }));
      
      // Mock sales data generation
      const salesData = [];
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Generate realistic sales data
        const orders = Math.floor(Math.random() * 50) + 10;
        const revenue = orders * (Math.random() * 2000 + 500);
        const profit = revenue * (0.15 + Math.random() * 0.25);
        
        salesData.push({
          user_id: user.id,
          marketplace,
          sale_date: date.toISOString().split('T')[0],
          revenue: parseFloat(revenue.toFixed(2)),
          profit: parseFloat(profit.toFixed(2)),
          orders_count: orders,
          products_count: Math.floor(orders * (1.2 + Math.random() * 0.8)),
        });
        
        // Update progress
        setSyncProgress(prev => ({ ...prev, [marketplace]: (i + 1) / 30 * 100 }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('Generated sales data:', salesData.length, 'records');
      
      // Use upsert to handle existing records
      const { error: upsertError } = await supabase
        .from('sales_data')
        .upsert(salesData, {
          onConflict: 'user_id,marketplace,sale_date',
          ignoreDuplicates: false
        });
      
      if (upsertError) {
        console.error('Upsert error:', upsertError);
        throw upsertError;
      }
      
      console.log('Successfully upserted sales data');
      
      // Update last sync time
      const { error: updateError } = await supabase
        .from('marketplace_connections')
        .update({ 
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('marketplace', marketplace);
      
      if (updateError) {
        console.error('Update sync time error:', updateError);
        throw updateError;
      }
      
      setSyncProgress(prev => ({ ...prev, [marketplace]: 100 }));
      return { marketplace, recordsCount: salesData.length };
    },
    onSuccess: (data) => {
      toast({
        title: "Синхронизация завершена",
        description: `${data.marketplace}: обновлено ${data.recordsCount} записей`,
      });
      queryClient.invalidateQueries({ queryKey: ['sync-statuses'] });
      queryClient.invalidateQueries({ queryKey: ['sales-data'] });
      queryClient.invalidateQueries({ queryKey: ['cost-data'] });
    },
    onError: (error: any) => {
      console.error('Sync error:', error);
      toast({
        title: "Ошибка синхронизации",
        description: error.message || "Не удалось синхронизировать данные",
        variant: "destructive",
      });
    },
    onSettled: (data, error, variables) => {
      setSyncProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[variables];
        return newProgress;
      });
    },
  });

  const syncAllMarketplaces = async () => {
    const connectedMarketplaces = syncStatuses?.filter(s => s.isConnected) || [];
    
    for (const status of connectedMarketplaces) {
      await syncMarketplaceMutation.mutateAsync(status.marketplace);
    }
  };

  return {
    syncStatuses: syncStatuses || [],
    isLoading,
    syncProgress,
    syncMarketplace: syncMarketplaceMutation.mutate,
    syncAllMarketplaces,
    isSyncing: syncMarketplaceMutation.isPending,
  };
};
