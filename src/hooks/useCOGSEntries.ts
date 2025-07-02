import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface COGSEntry {
  id?: string;
  cogs_date: string;
  product_name: string;
  unit_cost: number;
  marketplace: string;
  brand: string;
  subject: string;
  size: string;
  supplier_article: string;
  marketplace_article: string;
  barcode: string;
}

export const useCOGSEntries = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cogsEntries = [], isLoading } = useQuery({
    queryKey: ['cogs-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cogs_entries')
        .select('*')
        .order('cogs_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addCOGSEntryMutation = useMutation({
    mutationFn: async (entry: COGSEntry) => {
      const { data, error } = await supabase
        .from('cogs_entries')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cogs-entries'] });
      toast({
        title: 'Себестоимость добавлена',
        description: 'Запись успешно добавлена в историю',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить запись',
        variant: 'destructive',
      });
      console.error('Error adding COGS entry:', error);
    },
  });

  const deleteCOGSEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cogs_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cogs-entries'] });
      toast({
        title: 'Запись удалена',
        description: 'Запись успешно удалена из истории',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить запись',
        variant: 'destructive',
      });
      console.error('Error deleting COGS entry:', error);
    },
  });

  return {
    cogsEntries,
    isLoading,
    addCOGSEntry: addCOGSEntryMutation.mutate,
    deleteCOGSEntry: deleteCOGSEntryMutation.mutate,
    isAdding: addCOGSEntryMutation.isPending,
    isDeleting: deleteCOGSEntryMutation.isPending,
  };
};