
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Fetch user's financial data
    const [expensesResult, paymentsResult, salesResult] = await Promise.all([
      supabase.from('expense_journal').select('*').eq('user_id', userId).order('expense_date', { ascending: false }).limit(50),
      supabase.from('payment_journal').select('*').eq('user_id', userId).order('payment_date', { ascending: false }).limit(50),
      supabase.from('sales_data').select('*').eq('user_id', userId).order('sale_date', { ascending: false }).limit(50)
    ]);

    const expenses = expensesResult.data || [];
    const payments = paymentsResult.data || [];
    const sales = salesResult.data || [];

    // Prepare data summary for AI context
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const totalIncome = payments.filter(p => p.payment_type === 'income').reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPaymentExpenses = payments.filter(p => p.payment_type === 'expense').reduce((sum, p) => sum + Number(p.amount), 0);
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.revenue), 0);
    const totalProfit = sales.reduce((sum, s) => sum + Number(s.profit), 0);

    const dataContext = `
Данные пользователя:
- Общие расходы (журнал расходов): ${totalExpenses.toLocaleString('ru-RU')} ₽
- Общие доходы (журнал платежей): ${totalIncome.toLocaleString('ru-RU')} ₽ 
- Общие расходы (журнал платежей): ${totalPaymentExpenses.toLocaleString('ru-RU')} ₽
- Общая выручка: ${totalRevenue.toLocaleString('ru-RU')} ₽
- Общая прибыль: ${totalProfit.toLocaleString('ru-RU')} ₽
- Количество записей расходов: ${expenses.length}
- Количество записей платежей: ${payments.length}
- Количество записей продаж: ${sales.length}

Категории расходов: ${[...new Set(expenses.map(e => e.category))].join(', ')}
Маркетплейсы: ${[...new Set([...expenses, ...payments, ...sales].map(item => item.marketplace).filter(Boolean))].join(', ')}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Ты финансовый AI-аналитик, который помогает пользователям анализировать их данные о расходах, доходах и продажах. 

Твоя задача:
1. Анализировать финансовые данные и выявлять тренды
2. Предоставлять инсайты для оптимизации расходов
3. Помогать находить конкретную информацию в данных
4. Давать рекомендации по улучшению финансовых показателей

Отвечай на русском языке, будь точным и полезным. Используй форматирование markdown для лучшей читаемости.

${dataContext}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in financial-ai-agent function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
