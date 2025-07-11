
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ABCItem {
  id: string;
  name: string;
  sales_volume: number;
  revenue: number;
  profit: number;
  category: 'A' | 'B' | 'C';
  marketplace: string;
}

export const useABCAnalysis = (
  analysisType: 'sales_volume' | 'revenue' | 'profit' = 'revenue',
  marketplaceFilter: string[] = []
) => {
  const { data: abcItems, isLoading } = useQuery({
    queryKey: ['abc-analysis', analysisType, marketplaceFilter],
    queryFn: async (): Promise<ABCItem[]> => {
      let query = supabase
        .from('sales_data')
        .select('id, marketplace, sale_date, orders_count, revenue, profit')
        .order('sale_date', { ascending: false });

      if (marketplaceFilter.length > 0) {
        query = query.in('marketplace', marketplaceFilter);
      }

      const { data: salesData, error } = await query;

      if (error) {
        console.error('Error fetching sales data:', error);
        return [];
      }
      
      if (!salesData || salesData.length === 0) return [];

      // Преобразуем данные с явной типизацией
      const items: Omit<ABCItem, 'category'>[] = salesData.map(record => ({
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
    enabled: true,
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
