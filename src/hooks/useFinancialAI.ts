
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useFinancialAI = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Привет! Я ваш финансовый AI-аналитик. Я могу помочь вам анализировать расходы, доходы, выявлять тренды и давать рекомендации. О чем хотите узнать?',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('financial-ai-agent', {
        body: {
          message: content,
          userId: user.id,
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить ответ от AI-аналитика',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Привет! Я ваш финансовый AI-аналитик. Я могу помочь вам анализировать расходы, доходы, выявлять тренды и давать рекомендации. О чем хотите узнать?',
        timestamp: new Date(),
      },
    ]);
  };

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading,
  };
};
