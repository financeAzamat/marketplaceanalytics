
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface ExpenseEntry {
  id?: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  marketplace?: string;
  is_tax_deductible: boolean;
  receipt_url?: string;
}

export const useExpenseJournal = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expense-journal'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_journal')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: ExpenseEntry) => {
      const { data, error } = await supabase
        .from('expense_journal')
        .insert(expense)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-journal'] });
      toast({
        title: 'Расход добавлен',
        description: 'Запись успешно добавлена в журнал расходов',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить расход',
        variant: 'destructive',
      });
      console.error('Error adding expense:', error);
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expense_journal')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-journal'] });
      toast({
        title: 'Расход удален',
        description: 'Запись успешно удалена из журнала',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить расход',
        variant: 'destructive',
      });
      console.error('Error deleting expense:', error);
    },
  });

  return {
    expenses,
    isLoading,
    addExpense: addExpenseMutation.mutate,
    deleteExpense: deleteExpenseMutation.mutate,
    isAdding: addExpenseMutation.isPending,
    isDeleting: deleteExpenseMutation.isPending,
  };
};
