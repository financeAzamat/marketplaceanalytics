import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface CashFlowReportProps {
  reportId: string;
  reportName: string;
  dateFrom: Date;
  dateTo: Date;
  marketplace: string;
  periods: Array<{
    name: string;
    dateFrom: Date;
    dateTo: Date;
  }>;
}

interface CashFlowData {
  operationalIncome: number;
  operationalExpenses: { [key: string]: number };
  investmentIncome: number;
  financialIncome: number;
  financialExpenses: number;
}

export const CashFlowReport = ({ reportId, reportName, dateFrom, dateTo, marketplace, periods }: CashFlowReportProps) => {
  const { data: cashFlowData, isLoading } = useQuery({
    queryKey: ['cashflow-report', reportId, dateFrom, dateTo, marketplace],
    queryFn: async () => {
      // Получаем данные по доходам (payment_journal)
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_journal')
        .select('*')
        .gte('payment_date', dateFrom.toISOString().split('T')[0])
        .lte('payment_date', dateTo.toISOString().split('T')[0])
        .eq(marketplace !== 'all' ? 'marketplace' : 'id', marketplace !== 'all' ? marketplace : reportId);

      if (paymentsError) throw paymentsError;

      // Получаем данные по расходам (expense_journal)
      const { data: expenses, error: expensesError } = await supabase
        .from('expense_journal')
        .select('*')
        .gte('expense_date', dateFrom.toISOString().split('T')[0])
        .lte('expense_date', dateTo.toISOString().split('T')[0])
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
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-3/4">Наименование статей</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Поступления по операционной деятельности */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-semibold text-lg" colSpan={2}>
                Поступления по операционной деятельности
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6">(+) Поступления от продаж Ozon</TableCell>
              <TableCell className="text-right font-medium text-green-600">
                {formatAmount(cashFlowData.operationalIncome * 0.4)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6">(+) Поступления от продаж Wildberries</TableCell>
              <TableCell className="text-right font-medium text-green-600">
                {formatAmount(cashFlowData.operationalIncome * 0.6)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6">(+) Прочие поступления</TableCell>
              <TableCell className="text-right font-medium">
                {formatAmount(0)}
              </TableCell>
            </TableRow>

            {/* Платежи по операционной деятельности */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-semibold text-lg" colSpan={2}>
                Платежи по операционной деятельности
              </TableCell>
            </TableRow>
            
            {/* Wildberries */}
            <TableRow className="bg-muted/30">
              <TableCell className="font-medium pl-4" colSpan={2}>Wildberries</TableCell>
            </TableRow>
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
              <TableRow key={`wb-${index}`}>
                <TableCell className="pl-8 text-sm">(-) {expense}</TableCell>
                <TableCell className="text-right text-sm">
                  {formatAmount(cashFlowData.operationalExpenses[expense] || 0)}
                </TableCell>
              </TableRow>
            ))}

            {/* Ozon */}
            <TableRow className="bg-muted/30">
              <TableCell className="font-medium pl-4" colSpan={2}>Ozon</TableCell>
            </TableRow>
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
              <TableRow key={`ozon-${index}`}>
                <TableCell className="pl-8 text-sm">(-) {expense}</TableCell>
                <TableCell className="text-right text-sm">
                  {formatAmount(cashFlowData.operationalExpenses[expense] || 0)}
                </TableCell>
              </TableRow>
            ))}

            {/* Другое */}
            <TableRow className="bg-muted/30">
              <TableCell className="font-medium pl-4" colSpan={2}>Другое</TableCell>
            </TableRow>
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
              <TableRow key={`other-${index}`}>
                <TableCell className="pl-8 text-sm">(-) {expense}</TableCell>
                <TableCell className="text-right text-sm">
                  {formatAmount(cashFlowData.operationalExpenses[expense] || 0)}
                </TableCell>
              </TableRow>
            ))}

            {/* Итог операционной деятельности */}
            <TableRow className="border-t-2 bg-blue-50">
              <TableCell className="font-bold text-lg">
                ЧИСТЫЙ ДЕНЕЖНЫЙ ПОТОК ОТ ОПЕРАЦИОННОЙ ДЕЯТЕЛЬНОСТИ
              </TableCell>
              <TableCell className={`text-right font-bold text-lg ${netOperationalFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(netOperationalFlow)}
              </TableCell>
            </TableRow>

            {/* Инвестиционная деятельность */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-semibold text-lg" colSpan={2}>
                Инвестиционная деятельность
              </TableCell>
            </TableRow>
            <TableRow className="bg-muted/30">
              <TableCell className="font-medium pl-4" colSpan={2}>Wildberries</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">(+) Привлечение инвестиций</TableCell>
              <TableCell className="text-right">{formatAmount(0)}</TableCell>
            </TableRow>
            <TableRow className="bg-muted/30">
              <TableCell className="font-medium pl-4" colSpan={2}>Ozon</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">(+) Привлечение инвестиций</TableCell>
              <TableCell className="text-right">{formatAmount(0)}</TableCell>
            </TableRow>
            <TableRow className="bg-muted/30">
              <TableCell className="font-medium pl-4" colSpan={2}>Другое</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">(+) Привлечение инвестиций</TableCell>
              <TableCell className="text-right">{formatAmount(cashFlowData.investmentIncome)}</TableCell>
            </TableRow>

            <TableRow className="border-t-2 bg-blue-50">
              <TableCell className="font-bold text-lg">
                ЧИСТЫЙ ДЕНЕЖНЫЙ ПОТОК ОТ ИНВЕСТИЦИОННОЙ ДЕЯТЕЛЬНОСТИ
              </TableCell>
              <TableCell className={`text-right font-bold text-lg ${netInvestmentFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(netInvestmentFlow)}
              </TableCell>
            </TableRow>

            {/* Финансовая деятельность */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-semibold text-lg" colSpan={2}>
                Поступления от финансовой деятельности
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6">(+) Получение займа</TableCell>
              <TableCell className="text-right">{formatAmount(0)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6">(+) Проценты по комиссиям и вкладам</TableCell>
              <TableCell className="text-right">{formatAmount(0)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6">(+) Поступления от собственника</TableCell>
              <TableCell className="text-right">{formatAmount(cashFlowData.financialIncome)}</TableCell>
            </TableRow>

            <TableRow className="bg-muted/50">
              <TableCell className="font-semibold text-lg" colSpan={2}>
                Платежи по финансовой деятельности
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6">(-) Займ (погашение тела долга)</TableCell>
              <TableCell className="text-right">{formatAmount(0)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6">(-) Займ (выплата процентов)</TableCell>
              <TableCell className="text-right">{formatAmount(0)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6">(-) Выплата дивидендов</TableCell>
              <TableCell className="text-right">{formatAmount(cashFlowData.financialExpenses)}</TableCell>
            </TableRow>

            <TableRow className="border-t-2 bg-blue-50">
              <TableCell className="font-bold text-lg">
                ЧИСТЫЙ ДЕНЕЖНЫЙ ПОТОК ОТ ФИНАНСОВОЙ ДЕЯТЕЛЬНОСТИ
              </TableCell>
              <TableCell className={`text-right font-bold text-lg ${netFinancialFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(netFinancialFlow)}
              </TableCell>
            </TableRow>

            {/* Итоговые показатели */}
            <TableRow className="border-t-4 bg-yellow-50">
              <TableCell className="font-bold text-xl">
                ИТОГО ЧИСТЫЙ ДЕНЕЖНЫЙ ПОТОК КОМПАНИИ
              </TableCell>
              <TableCell className={`text-right font-bold text-xl ${totalNetFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(totalNetFlow)}
              </TableCell>
            </TableRow>
            <TableRow className="bg-gray-50">
              <TableCell className="font-semibold">ОСТАТОК ДС НА НАЧАЛО ПЕРИОДА</TableCell>
              <TableCell className="text-right font-semibold">{formatAmount(0)}</TableCell>
            </TableRow>
            <TableRow className="bg-gray-50">
              <TableCell className="font-semibold">ОСТАТОК ДС НА КОНЕЦ ПЕРИОДА</TableCell>
              <TableCell className={`text-right font-semibold ${totalNetFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(totalNetFlow)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};