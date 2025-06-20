
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SalesDataEntry {
  id: string;
  marketplace: string;
  sale_date: string;
  revenue: number;
  profit: number;
  orders_count: number;
  products_count: number;
}

export const useSalesData = (dateFrom?: string, dateTo?: string, marketplace?: string) => {
  const { data: salesData, isLoading, refetch } = useQuery({
    queryKey: ['sales-data', dateFrom, dateTo, marketplace],
    queryFn: async () => {
      let query = supabase
        .from('sales_data')
        .select('*')
        .order('sale_date', { ascending: false });

      // Применяем фильтры только если они указаны
      if (dateFrom) {
        query = query.gte('sale_date', dateFrom);
      }
      if (dateTo) {
        query = query.lte('sale_date', dateTo);
      }
      if (marketplace && marketplace !== 'all') {
        query = query.eq('marketplace', marketplace);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Функция для проверки существующих данных в БД
  const checkExistingData = async (marketplace: string, dateFrom?: string, dateTo?: string) => {
    let query = supabase
      .from('sales_data')
      .select('sale_date')
      .eq('marketplace', marketplace);

    if (dateFrom) {
      query = query.gte('sale_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('sale_date', dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data?.map(item => item.sale_date) || [];
  };

  const addSalesData = async (data: Omit<SalesDataEntry, 'id'>) => {
    const { error } = await supabase
      .from('sales_data')
      .insert(data);
    
    if (error) throw error;
    refetch();
  };

  return {
    salesData: salesData || [],
    isLoading,
    addSalesData,
    checkExistingData,
    refetch,
  };
};
