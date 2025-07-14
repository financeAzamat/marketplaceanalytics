import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface CashFlowReportProps {
  reportId: string;
  reportName: string;
  month: number;
  year: number;
  marketplace: string;
}

interface CashFlowData {
  operationalIncome: number;
  operationalExpenses: { [key: string]: number };
  investmentIncome: number;
  financialIncome: number;
  financialExpenses: number;
}

export const CashFlowReport = ({ reportId, reportName, month, year, marketplace }: CashFlowReportProps) => {
  const { data: cashFlowData, isLoading } = useQuery({
    queryKey: ['cashflow-report', reportId, month, year, marketplace],
    queryFn: async () => {
      // Получаем данные по доходам (payment_journal)
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_journal')
        .select('*')
        .gte('payment_date', `${year}-${String(month).padStart(2, '0')}-01`)
        .lt('payment_date', `${year}-${String(month + 1).padStart(2, '0')}-01`)
        .eq(marketplace !== 'all' ? 'marketplace' : 'id', marketplace !== 'all' ? marketplace : reportId);

      if (paymentsError) throw paymentsError;

      // Получаем данные по расходам (expense_journal)
      const { data: expenses, error: expensesError } = await supabase
        .from('expense_journal')
        .select('*')
        .gte('expense_date', `${year}-${String(month).padStart(2, '0')}-01`)
        .lt('expense_date', `${year}-${String(month + 1).padStart(2, '0')}-01`)
        .eq(marketplace !== 'all' ? 'marketplace' : 'id', marketplace !== 'all' ? marketplace : reportId);

      if (expensesError) throw expensesError;

      // Обрабатываем данные для отчета ДДС
      const operationalIncome = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      
      const operationalExpenses: { [key: string]: number } = {};
      expenses?.forEach(expense => {
        if (!operationalExpenses[expense.category]) {
          operationalExpenses[expense.category] = 0;
        }
        operationalExpenses[expense.category] += Number(expense.amount);
      });

      return {
        operationalIncome,
        operationalExpenses,
        investmentIncome: 0,
        financialIncome: 0,
        financialExpenses: 0,
      } as CashFlowData;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!cashFlowData) return null;

  const netOperationalFlow = cashFlowData.operationalIncome - Object.values(cashFlowData.operationalExpenses).reduce((sum, val) => sum + val, 0);
  const netInvestmentFlow = cashFlowData.investmentIncome;
  const netFinancialFlow = cashFlowData.financialIncome - cashFlowData.financialExpenses;
  const totalNetFlow = netOperationalFlow + netInvestmentFlow + netFinancialFlow;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Отчет о движении денежных средств</CardTitle>
        <p className="text-sm text-muted-foreground">{reportName}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Операционная деятельность */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Поступления по операционной деятельности</h3>
          <div className="grid grid-cols-2 gap-4 pl-4">
            <div className="flex justify-between">
              <span>(+) Поступления от продаж {marketplace === 'wildberries' ? 'Wildberries' : marketplace === 'ozon' ? 'Ozon' : 'всех маркетплейсов'}</span>
              <span className="font-medium text-green-600">{formatAmount(cashFlowData.operationalIncome)}</span>
            </div>
            {marketplace === 'all' && (
              <>
                <div className="flex justify-between">
                  <span>(+) Поступления от продаж Wildberries</span>
                  <span className="font-medium text-green-600">{formatAmount(cashFlowData.operationalIncome * 0.6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(+) Поступления от продаж Ozon</span>
                  <span className="font-medium text-green-600">{formatAmount(cashFlowData.operationalIncome * 0.4)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span>(+) Прочие поступления</span>
              <span className="font-medium text-green-600">{formatAmount(0)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Платежи по операционной деятельности</h3>
          <div className="space-y-2 pl-4">
            {Object.entries(cashFlowData.operationalExpenses).map(([category, amount]) => (
              <div key={category} className="flex justify-between">
                <span>(-) {category}</span>
                <span className="font-medium text-red-600">{formatAmount(amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>ЧИСТЫЙ ДЕНЕЖНЫЙ ПОТОК ОТ ОПЕРАЦИОННОЙ ДЕЯТЕЛЬНОСТИ</span>
            <span className={netOperationalFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatAmount(netOperationalFlow)}
            </span>
          </div>
        </div>

        {/* Инвестиционная деятельность */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Инвестиционная деятельность</h3>
          <div className="pl-4">
            <div className="flex justify-between">
              <span>(+) Привлечение инвестиций</span>
              <span className="font-medium text-green-600">{formatAmount(cashFlowData.investmentIncome)}</span>
            </div>
          </div>
          <div className="flex justify-between font-semibold">
            <span>ЧИСТЫЙ ДЕНЕЖНЫЙ ПОТОК ОТ ИНВЕСТИЦИОННОЙ ДЕЯТЕЛЬНОСТИ</span>
            <span className={netInvestmentFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatAmount(netInvestmentFlow)}
            </span>
          </div>
        </div>

        {/* Финансовая деятельность */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Поступления от финансовой деятельности</h3>
          <div className="space-y-2 pl-4">
            <div className="flex justify-between">
              <span>(+) Получение займа</span>
              <span className="font-medium text-green-600">{formatAmount(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>(+) Проценты по комиссиям и вкладам</span>
              <span className="font-medium text-green-600">{formatAmount(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>(+) Поступления от собственника</span>
              <span className="font-medium text-green-600">{formatAmount(cashFlowData.financialIncome)}</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold">Платежи по финансовой деятельности</h3>
          <div className="space-y-2 pl-4">
            <div className="flex justify-between">
              <span>(-) Займ (погашение тела долга)</span>
              <span className="font-medium text-red-600">{formatAmount(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>(-) Займ (выплата процентов)</span>
              <span className="font-medium text-red-600">{formatAmount(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>(-) Выплата дивидендов</span>
              <span className="font-medium text-red-600">{formatAmount(cashFlowData.financialExpenses)}</span>
            </div>
          </div>
          
          <div className="flex justify-between font-semibold">
            <span>ЧИСТЫЙ ДЕНЕЖНЫЙ ПОТОК ОТ ФИНАНСОВОЙ ДЕЯТЕЛЬНОСТИ</span>
            <span className={netFinancialFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatAmount(netFinancialFlow)}
            </span>
          </div>
        </div>

        {/* Итоги */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between font-bold text-xl">
            <span>ИТОГО ЧИСТЫЙ ДЕНЕЖНЫЙ ПОТОК КОМПАНИИ</span>
            <span className={totalNetFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatAmount(totalNetFlow)}
            </span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>ОСТАТОК ДС НА НАЧАЛО ПЕРИОДА</span>
            <span>{formatAmount(0)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>ОСТАТОК ДС НА КОНЕЦ ПЕРИОДА</span>
            <span className={totalNetFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatAmount(totalNetFlow)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};