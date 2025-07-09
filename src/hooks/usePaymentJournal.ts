
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface PaymentEntry {
  id?: string;
  payment_date: string;
  category: string;
  description: string;
  amount: number;
  marketplace: string;
}

export const usePaymentJournal = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payment-journal'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_journal')
        .select('*')
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (payment: PaymentEntry) => {
      const { data, error } = await supabase
        .from('payment_journal')
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-journal'] });
      toast({
        title: 'Доход добавлен',
        description: 'Запись успешно добавлена в журнал доходов',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить доход',
        variant: 'destructive',
      });
      console.error('Error adding payment:', error);
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payment_journal')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-journal'] });
      toast({
        title: 'Доход удален',
        description: 'Запись успешно удалена из журнала',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить доход',
        variant: 'destructive',
      });
      console.error('Error deleting payment:', error);
    },
  });

  return {
    payments,
    isLoading,
    addPayment: addPaymentMutation.mutate,
    deletePayment: deletePaymentMutation.mutate,
    isAdding: addPaymentMutation.isPending,
    isDeleting: deletePaymentMutation.isPending,
  };
};
