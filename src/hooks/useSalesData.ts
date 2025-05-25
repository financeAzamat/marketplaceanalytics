
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SalesDataEntry {
  id: string;
  marketplace: string;
  sale_date: string;
  revenue: number;
  profit: number;
  orders_count: number;
  products_count: number;
}

export const useSalesData = (dateFrom?: string, dateTo?: string) => {
  const { user } = useAuth();

  const { data: salesData, isLoading, refetch } = useQuery({
    queryKey: ['sales-data', user?.id, dateFrom, dateTo],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('sales_data')
        .select('*')
        .eq('user_id', user.id)
        .order('sale_date', { ascending: false });

      if (dateFrom) {
        query = query.gte('sale_date', dateFrom);
      }
      if (dateTo) {
        query = query.lte('sale_date', dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const addSalesData = async (data: Omit<SalesDataEntry, 'id'>) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    const { error } = await supabase
      .from('sales_data')
      .insert({
        ...data,
        user_id: user.id,
      });
    
    if (error) throw error;
    refetch();
  };

  return {
    salesData: salesData || [],
    isLoading,
    addSalesData,
    refetch,
  };
};
