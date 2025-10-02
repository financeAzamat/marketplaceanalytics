import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductSale {
  id: string;
  sale_date: string;
  marketplace: string;
  product_name: string;
  supplier_article?: string;
  marketplace_article?: string;
  subject?: string;
  quantity: number;
  revenue: number;
  profit: number;
  cogs: number;
  commission: number;
  last_sale_date?: string;
  days_since_last_sale?: number;
}

export const useProductSales = (dateFrom?: string, dateTo?: string, marketplace?: string) => {
  const { data: productSales, isLoading, refetch } = useQuery({
    queryKey: ['product-sales', dateFrom, dateTo, marketplace],
    queryFn: async () => {
      let query = supabase
        .from('product_sales')
        .select('*')
        .order('sale_date', { ascending: false });

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

  return {
    productSales: productSales || [],
    isLoading,
    refetch,
  };
};