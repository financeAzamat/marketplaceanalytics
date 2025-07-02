
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface CostEntry {
  id?: string;
  cost_date: string;
  category: string;
  description: string;
  amount: number;
  marketplace?: string;
  cost_type: 'operational' | 'logistics' | 'material' | 'other';
}

export interface COGSEntry {
  id?: string;
  cogs_date: string;
  product_name: string;
  description: string;
  unit_cost: number;
  quantity: number;
  total_amount: number;
}

export const useCostData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cost entries
  const { data: costs = [], isLoading: costsLoading } = useQuery({
    queryKey: ['costs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Add cost entry
  const addCostMutation = useMutation({
    mutationFn: async (cost: CostEntry) => {
      const { data, error } = await supabase
        .from('cost_data')
        .insert({
          file_name: `Manual Entry - ${cost.description}`,
          total_amount: cost.amount,
          status: 'processed',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costs'] });
      toast({
        title: 'Затрата добавлена',
        description: 'Запись успешно добавлена в журнал затрат',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить затрату',
        variant: 'destructive',
      });
      console.error('Error adding cost:', error);
    },
  });

  // Upload cost file
  const uploadCostFile = async (file: File) => {
    const totalAmount = Math.random() * 50000 + 10000; // Mock calculation
    
    const { error } = await supabase
      .from('cost_data')
      .insert({
        file_name: file.name,
        total_amount: totalAmount,
        status: 'processed',
      });
    
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['costs'] });
  };

  const deleteCostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cost_data')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costs'] });
      toast({
        title: 'Затрата удалена',
        description: 'Запись успешно удалена из журнала',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить затрату',
        variant: 'destructive',
      });
      console.error('Error deleting cost:', error);
    },
  });

  return {
    costs,
    isLoading: costsLoading,
    addCost: addCostMutation.mutate,
    deleteCost: deleteCostMutation.mutate,
    uploadCostFile,
    isAdding: addCostMutation.isPending,
    isDeleting: deleteCostMutation.isPending,
  };
};
