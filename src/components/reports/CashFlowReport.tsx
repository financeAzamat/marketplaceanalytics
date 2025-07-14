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
        
        {/* Поступления по операционной деятельности */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg border-b pb-2">Поступления по операционной деятельности</h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>(+) Поступления от продаж Ozon</span>
              <span className="text-right font-medium">{formatAmount(cashFlowData.operationalIncome * 0.4)}</span>
            </div>
            <div className="flex justify-between">
              <span>(+) Поступления от продаж Wildberries</span>
              <span className="text-right font-medium">{formatAmount(cashFlowData.operationalIncome * 0.6)}</span>
            </div>
            <div className="flex justify-between">
              <span>(+) Прочие поступления</span>
              <span className="text-right font-medium">{formatAmount(0)}</span>
            </div>
          </div>
        </div>

        {/* Платежи по операционной деятельности - Wildberries */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg border-b pb-2">Платежи по операционной деятельности</h3>
          <h4 className="font-medium text-base">Wildberries</h4>
          <div className="space-y-1 text-sm">
            {[
              'Возвраты Wildberries',
              'Представительские расходы',
              'Основные средства',
              'HR',
              'Расходы на расчетно-кассовое обслуживание',
              'Фонд оплаты труда',
              'Аренда',
              'Закупка товара',
              'Образцы; Лекала',
              'Внешняя логистика',
              'Сервисы; Программное обеспечение',
              'Связь и интернет',
              'Услуги Фулфилмента',
              'Регистрация ИП',
              'Приемка товара',
              'Штрафы',
              'Штраф за смену характеристик',
              'Штрафах за отсутствие обязательной маркировки',
              'Продвижение товара',
              'Создание контента',
              'Расходный материал',
              'Честный Знак; КиЗы; Гос. Пошлины',
              'Сертификация и регистрация торговых марок',
              'Прочие платежи',
              'Налоги и пошлины'
            ].map((expense, index) => (
              <div key={index} className="flex justify-between">
                <span>(-) {expense}</span>
                <span className="text-right">{formatAmount(cashFlowData.operationalExpenses[expense] || 0)}</span>
              </div>
            ))}
          </div>

          {/* Ozon */}
          <h4 className="font-medium text-base pt-4">Ozon</h4>
          <div className="space-y-1 text-sm">
            {[
              'Возвраты Ozon',
              'Представительские расходы',
              'Основные средства',
              'HR',
              'Расходы на расчетно-кассовое обслуживание',
              'Фонд оплаты труда',
              'Аренда',
              'Закупка товара',
              'Образцы; Лекала',
              'Внешняя логистика',
              'Сервисы; Программное обеспечение',
              'Связь и интернет',
              'Услуги Фулфилмента',
              'Регистрация ИП',
              'Комиссии',
              'Комиссия за возврат',
              'Комиссия за доставку',
              'Продвижение товара',
              'Создание контента',
              'Расходный материал',
              'Честный Знак; КиЗы; Гос. Пошлины',
              'Сертификация и регистрация торговых марок',
              'Налоги и пошлины',
              'Прочие платежи'
            ].map((expense, index) => (
              <div key={index} className="flex justify-between">
                <span>(-) {expense}</span>
                <span className="text-right">{formatAmount(cashFlowData.operationalExpenses[expense] || 0)}</span>
              </div>
            ))}
          </div>

          {/* Другое */}
          <h4 className="font-medium text-base pt-4">Другое</h4>
          <div className="space-y-1 text-sm">
            {[
              'Представительские расходы',
              'Основные средства',
              'HR',
              'Расходы на расчетно-кассовое обслуживание',
              'Фонд оплаты труда',
              'Аренда',
              'Закупка товара',
              'Образцы; Лекала',
              'Внешняя логистика',
              'Сервисы; Программное обеспечение',
              'Связь и интернет',
              'Услуги Фулфилмента',
              'Регистрация ИП',
              'Приемка товара',
              'Продвижение товара',
              'Создание контента',
              'Расходный материал',
              'Честный Знак; КиЗы; Гос. Пошлины',
              'Сертификация и регистрация торговых марок',
              'Налоги и пошлины',
              'Прочие платежи'
            ].map((expense, index) => (
              <div key={index} className="flex justify-between">
                <span>(-) {expense}</span>
                <span className="text-right">{formatAmount(cashFlowData.operationalExpenses[expense] || 0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Чистый денежный поток от операционной деятельности */}
        <div className="border-t pt-4">
          <div className="flex justify-between font-semibold text-lg">
            <span>ЧИСТЫЙ ДЕНЕЖНЫЙ ПОТОК ОТ ОПЕРАЦИОННОЙ ДЕЯТЕЛЬНОСТИ</span>
            <span className={`text-right ${netOperationalFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(netOperationalFlow)}
            </span>
          </div>
        </div>

        {/* Инвестиционная деятельность */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg border-b pb-2">Инвестиционная деятельность</h3>
          <h4 className="font-medium text-base">Wildberries</h4>
          <div className="flex justify-between text-sm">
            <span>(+) Привлечение инвестиций</span>
            <span className="text-right">{formatAmount(0)}</span>
          </div>
          <h4 className="font-medium text-base">Ozon</h4>
          <div className="flex justify-between text-sm">
            <span>(+) Привлечение инвестиций</span>
            <span className="text-right">{formatAmount(0)}</span>
          </div>
          <h4 className="font-medium text-base">Другое</h4>
          <div className="flex justify-between text-sm">
            <span>(+) Привлечение инвестиций</span>
            <span className="text-right">{formatAmount(cashFlowData.investmentIncome)}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between font-semibold text-lg">
            <span>ЧИСТЫЙ ДЕНЕЖНЫЙ ПОТОК ОТ ИНВЕСТИЦИОННОЙ ДЕЯТЕЛЬНОСТИ</span>
            <span className={`text-right ${netInvestmentFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(netInvestmentFlow)}
            </span>
          </div>
        </div>

        {/* Финансовая деятельность */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg border-b pb-2">Поступления от финансовой деятельности</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>(+) Получение займа</span>
              <span className="text-right">{formatAmount(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>(+) Проценты по комиссиям и вкладам</span>
              <span className="text-right">{formatAmount(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>(+) Поступления от собственника</span>
              <span className="text-right">{formatAmount(cashFlowData.financialIncome)}</span>
            </div>
          </div>

          <h4 className="font-medium text-base pt-4">Платежи по финансовой деятельности</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>(-) Займ (погашение тела долга)</span>
              <span className="text-right">{formatAmount(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>(-) Займ (выплата процентов)</span>
              <span className="text-right">{formatAmount(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>(-) Выплата дивидендов</span>
              <span className="text-right">{formatAmount(cashFlowData.financialExpenses)}</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between font-semibold text-lg">
            <span>ЧИСТЫЙ ДЕНЕЖНЫЙ ПОТОК ОТ ФИНАНСОВОЙ ДЕЯТЕЛЬНОСТИ</span>
            <span className={`text-right ${netFinancialFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(netFinancialFlow)}
            </span>
          </div>
        </div>

        {/* Итоговые показатели */}
        <div className="border-t-2 pt-4 space-y-2">
          <div className="flex justify-between font-bold text-xl">
            <span>ИТОГО ЧИСТЫЙ ДЕНЕЖНЫЙ ПОТОК КОМПАНИИ</span>
            <span className={`text-right ${totalNetFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(totalNetFlow)}
            </span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>ОСТАТОК ДС НА НАЧАЛО ПЕРИОДА</span>
            <span className="text-right">{formatAmount(0)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>ОСТАТОК ДС НА КОНЕЦ ПЕРИОДА</span>
            <span className={`text-right ${totalNetFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(totalNetFlow)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};