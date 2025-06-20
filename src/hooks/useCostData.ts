
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CostDataEntry {
  id: string;
  file_name: string;
  upload_date: string;
  total_amount: number;
  status: string;
}

export const useCostData = () => {
  const { data: costData, isLoading, refetch } = useQuery({
    queryKey: ['cost-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_data')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const uploadCostFile = async (file: File) => {
    // Simple Excel parsing simulation - in real app you'd use a library like xlsx
    const totalAmount = Math.random() * 50000 + 10000; // Mock calculation
    
    const { error } = await supabase
      .from('cost_data')
      .insert({
        file_name: file.name,
        total_amount: totalAmount,
        status: 'processed',
      });
    
    if (error) throw error;
    refetch();
  };

  return {
    costData: costData || [],
    isLoading,
    uploadCostFile,
    refetch,
  };
};
