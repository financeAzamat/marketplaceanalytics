
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ABCItem {
  id: string;
  name: string;
  sales_volume: number;
  revenue: number;
  profit: number;
  category: 'A' | 'B' | 'C';
  marketplace: string;
}

interface SalesDataRow {
  id: string;
  marketplace: string;
  sale_date: string;
  orders_count: number;
  revenue: number;
  profit: number;
}

export const useABCAnalysis = (
  analysisType: 'sales_volume' | 'revenue' | 'profit' = 'revenue',
  marketplaceFilter: string[] = []
) => {
  const { user } = useAuth();

  const { data: abcItems, isLoading } = useQuery({
    queryKey: ['abc-analysis', user?.id, analysisType, marketplaceFilter],
    queryFn: async (): Promise<ABCItem[]> => {
      if (!user?.id) return [];
      
      // Явно типизируем запрос
      const query = supabase
        .from('sales_data')
        .select('id, marketplace, sale_date, orders_count, revenue, profit')
        .eq('user_id', user.id)
        .order('sale_date', { ascending: false });

      let finalQuery = query;
      if (marketplaceFilter.length > 0) {
        finalQuery = query.in('marketplace', marketplaceFilter);
      }

      const { data: salesData, error } = await finalQuery;

      if (error) throw error;
      if (!salesData || salesData.length === 0) return [];

      // Преобразуем данные с явной типизацией
      const items: Omit<ABCItem, 'category'>[] = (salesData as SalesDataRow[]).map(record => ({
        id: record.id,
        name: `${record.marketplace} - ${new Date(record.sale_date).toLocaleDateString('ru-RU')}`,
        sales_volume: record.orders_count,
        revenue: Number(record.revenue),
        profit: Number(record.profit),
        marketplace: record.marketplace,
      }));

      // Sort by analysis type
      items.sort((a, b) => b[analysisType] - a[analysisType]);

      // Apply ABC categorization (Pareto principle)
      const totalValue = items.reduce((sum, item) => sum + item[analysisType], 0);
      let cumulativeValue = 0;
      
      const categorizedItems: ABCItem[] = items.map(item => {
        cumulativeValue += item[analysisType];
        const cumulativePercentage = (cumulativeValue / totalValue) * 100;
        
        let category: 'A' | 'B' | 'C';
        if (cumulativePercentage <= 80) {
          category = 'A';
        } else if (cumulativePercentage <= 95) {
          category = 'B';
        } else {
          category = 'C';
        }
        
        return {
          ...item,
          category,
        };
      });

      return categorizedItems;
    },
    enabled: !!user?.id,
  });

  // Calculate category summaries
  const categorySummary = (abcItems || []).reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { count: 0, sales_volume: 0, revenue: 0, profit: 0 };
    }
    acc[item.category].count += 1;
    acc[item.category].sales_volume += item.sales_volume;
    acc[item.category].revenue += item.revenue;
    acc[item.category].profit += item.profit;
    return acc;
  }, {} as Record<string, { count: number; sales_volume: number; revenue: number; profit: number }>);

  // Calculate totals
  const totals = (abcItems || []).reduce((acc, item) => {
    acc.count += 1;
    acc.sales_volume += item.sales_volume;
    acc.revenue += item.revenue;
    acc.profit += item.profit;
    return acc;
  }, { count: 0, sales_volume: 0, revenue: 0, profit: 0 });

  return {
    abcItems: abcItems || [],
    categorySummary,
    totals,
    isLoading,
  };
};
