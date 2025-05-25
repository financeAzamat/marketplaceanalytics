
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
    
    // Fetch user's financial data with more details
    const [expensesResult, paymentsResult, salesResult] = await Promise.all([
      supabase.from('expense_journal').select('*').eq('user_id', userId).order('expense_date', { ascending: false }).limit(100),
      supabase.from('payment_journal').select('*').eq('user_id', userId).order('payment_date', { ascending: false }).limit(100),
      supabase.from('sales_data').select('*').eq('user_id', userId).order('sale_date', { ascending: false }).limit(100)
    ]);

    const expenses = expensesResult.data || [];
    const payments = paymentsResult.data || [];
    const sales = salesResult.data || [];

    // Prepare detailed data context for AI
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const totalIncome = payments.filter(p => p.payment_type === 'income').reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPaymentExpenses = payments.filter(p => p.payment_type === 'expense').reduce((sum, p) => sum + Number(p.amount), 0);
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.revenue), 0);
    const totalProfit = sales.reduce((sum, s) => sum + Number(s.profit), 0);

    // Create detailed expense analysis
    const expensesByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
      return acc;
    }, {});

    const expensesByMarketplace = expenses.reduce((acc, exp) => {
      if (exp.marketplace) {
        acc[exp.marketplace] = (acc[exp.marketplace] || 0) + Number(exp.amount);
      }
      return acc;
    }, {});

    // Create detailed sales analysis
    const salesByMarketplace = sales.reduce((acc, s) => {
      acc[s.marketplace] = {
        revenue: (acc[s.marketplace]?.revenue || 0) + Number(s.revenue),
        profit: (acc[s.marketplace]?.profit || 0) + Number(s.profit),
        orders: (acc[s.marketplace]?.orders || 0) + Number(s.orders_count),
        products: (acc[s.marketplace]?.products || 0) + Number(s.products_count)
      };
      return acc;
    }, {});

    // Get recent records for trend analysis
    const recentExpenses = expenses.slice(0, 10);
    const recentPayments = payments.slice(0, 10);
    const recentSales = sales.slice(0, 10);

    const dataContext = `
ФИНАНСОВЫЕ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ:

=== ОБЩИЕ ПОКАЗАТЕЛИ ===
- Общие расходы (журнал расходов): ${totalExpenses.toLocaleString('ru-RU')} ₽
- Общие доходы (журнал платежей): ${totalIncome.toLocaleString('ru-RU')} ₽ 
- Общие расходы (журнал платежей): ${totalPaymentExpenses.toLocaleString('ru-RU')} ₽
- Общая выручка: ${totalRevenue.toLocaleString('ru-RU')} ₽
- Общая прибыль: ${totalProfit.toLocaleString('ru-RU')} ₽
- Количество записей расходов: ${expenses.length}
- Количество записей платежей: ${payments.length}
- Количество записей продаж: ${sales.length}

=== ДЕТАЛЬНЫЙ АНАЛИЗ РАСХОДОВ ===
Расходы по категориям:
${Object.entries(expensesByCategory).map(([cat, amount]) => `- ${cat}: ${Number(amount).toLocaleString('ru-RU')} ₽`).join('\n')}

Расходы по маркетплейсам:
${Object.entries(expensesByMarketplace).map(([mp, amount]) => `- ${mp}: ${Number(amount).toLocaleString('ru-RU')} ₽`).join('\n')}

=== ДЕТАЛЬНЫЙ АНАЛИЗ ПРОДАЖ ===
Продажи по маркетплейсам:
${Object.entries(salesByMarketplace).map(([mp, data]) => 
  `- ${mp}: Выручка ${data.revenue.toLocaleString('ru-RU')} ₽, Прибыль ${data.profit.toLocaleString('ru-RU')} ₽, Заказы ${data.orders}, Товары ${data.products}`
).join('\n')}

=== ПОСЛЕДНИЕ ЗАПИСИ (для анализа трендов) ===
Последние расходы:
${recentExpenses.map(exp => 
  `- ${exp.expense_date}: ${exp.category} - ${Number(exp.amount).toLocaleString('ru-RU')} ₽ (${exp.description.substring(0, 50)}...)`
).join('\n')}

Последние платежи:
${recentPayments.map(pay => 
  `- ${pay.payment_date}: ${pay.payment_type} ${pay.category} - ${Number(pay.amount).toLocaleString('ru-RU')} ₽ (${pay.description.substring(0, 50)}...)`
).join('\n')}

Последние продажи:
${recentSales.map(sale => 
  `- ${sale.sale_date}: ${sale.marketplace} - Выручка ${Number(sale.revenue).toLocaleString('ru-RU')} ₽, Прибыль ${Number(sale.profit).toLocaleString('ru-RU')} ₽`
).join('\n')}

=== ДОСТУПНЫЕ МАРКЕТПЛЕЙСЫ ===
${[...new Set([...expenses, ...payments, ...sales].map(item => item.marketplace).filter(Boolean))].join(', ')}
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
            content: `Ты опытный финансовый AI-аналитик, который помогает пользователям анализировать их бизнес-данные. 

Твои возможности:
1. Анализируй финансовые данные и выявляй тренды
2. Предоставляй конкретные инсайты для оптимизации бизнеса
3. Помогай находить конкретную информацию в данных
4. Давай практические рекомендации по улучшению показателей
5. Анализируй динамику по датам, категориям, маркетплейсам

Принципы работы:
- Используй ТОЛЬКО предоставленные реальные данные
- Если данных нет - прямо говори об этом
- Указывай конкретные цифры и периоды
- Выделяй самые важные тренды и аномалии
- Давай практические советы основанные на данных

Отвечай на русском языке, используй форматирование markdown для лучшей читаемости.

${dataContext}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
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
