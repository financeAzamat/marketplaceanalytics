
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CostDataEntry {
  id: string;
  file_name: string;
  upload_date: string;
  total_amount: number;
  status: string;
}

export const useCostData = () => {
  const { user } = useAuth();

  const { data: costData, isLoading, refetch } = useQuery({
    queryKey: ['cost-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('cost_data')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const uploadCostFile = async (file: File) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    // Simple Excel parsing simulation - in real app you'd use a library like xlsx
    const totalAmount = Math.random() * 50000 + 10000; // Mock calculation
    
    const { error } = await supabase
      .from('cost_data')
      .insert({
        user_id: user.id,
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
