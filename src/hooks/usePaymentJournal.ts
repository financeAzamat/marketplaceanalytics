
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PaymentEntry {
  id?: string;
  payment_date: string;
  payment_type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'card' | 'electronic';
  marketplace?: string;
  invoice_number?: string;
}

export const usePaymentJournal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payment-journal', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('payment_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (payment: PaymentEntry) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('payment_journal')
        .insert({
          ...payment,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-journal'] });
      toast({
        title: 'Платеж добавлен',
        description: 'Запись успешно добавлена в журнал платежей',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить платеж',
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
        title: 'Платеж удален',
        description: 'Запись успешно удалена из журнала',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить платеж',
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
