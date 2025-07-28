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

interface PeriodCashFlowData {
  [periodName: string]: {
    operationalIncome: number;
    operationalExpenses: { [key: string]: number };
    investmentIncome: number;
    financialIncome: number;
    financialExpenses: number;
  };
}

export const CashFlowReport = ({ reportId, reportName, dateFrom, dateTo, marketplace, periods }: CashFlowReportProps) => {
  const { data: periodCashFlowData, isLoading } = useQuery({
    queryKey: ['cashflow-report', reportId, dateFrom, dateTo, marketplace, periods],
    queryFn: async () => {
      const data: PeriodCashFlowData = {};
      
      // If no periods specified, create a single period for the entire range
      const periodsToProcess = periods.length > 0 ? periods : [{
        name: 'Общий период',
        dateFrom,
        dateTo
      }];

      for (const period of periodsToProcess) {
        // Получаем данные по доходам (payment_journal)
        const { data: payments, error: paymentsError } = await supabase
          .from('payment_journal')
          .select('*')
          .gte('payment_date', period.dateFrom.toISOString().split('T')[0])
          .lte('payment_date', period.dateTo.toISOString().split('T')[0]);

        if (paymentsError) throw paymentsError;

        // Получаем данные по расходам (expense_journal)
        const { data: expenses, error: expensesError } = await supabase
          .from('expense_journal')
          .select('*')
          .gte('expense_date', period.dateFrom.toISOString().split('T')[0])
          .lte('expense_date', period.dateTo.toISOString().split('T')[0]);

        if (expensesError) throw expensesError;

        // Обрабатываем данные по доходам
        let operationalIncome = 0;
        const operationalExpenses: { [key: string]: number } = {};
        
        payments?.forEach(payment => {
          operationalIncome += Number(payment.amount);
        });

        expenses?.forEach(expense => {
          const key = expense.category || 'Прочие расходы';
          operationalExpenses[key] = (operationalExpenses[key] || 0) + Number(expense.amount);
        });

        data[period.name] = {
          operationalIncome,
          operationalExpenses,
          investmentIncome: Math.floor(Math.random() * 50000), // Sample data
          financialIncome: Math.floor(Math.random() * 25000),
          financialExpenses: Math.floor(Math.random() * 15000)
        };
      }

      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!periodCashFlowData) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Не удалось загрузить данные отчета
          </div>
        </CardContent>
      </Card>
    );
  }

  const periodsToShow = periods.length > 0 ? periods : [{
    name: 'Общий период',
    dateFrom,
    dateTo
  }];

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₽';
  };

  // Собираем все уникальные категории расходов
  const allExpenseCategories = new Set<string>();
  Object.values(periodCashFlowData).forEach(data => {
    Object.keys(data.operationalExpenses).forEach(category => {
      allExpenseCategories.add(category);
    });
  });

  const expenseList = Array.from(allExpenseCategories);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{reportName} - Отчет о движении денежных средств</CardTitle>
        <p className="text-muted-foreground">
          Период: {dateFrom.toLocaleDateString('ru-RU')} - {dateTo.toLocaleDateString('ru-RU')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[300px] sticky left-0 bg-background border-r">Статья движения денежных средств</TableHead>
                {periodsToShow.map((period, index) => (
                  <TableHead key={index} className="text-right min-w-[150px]">
                    {period.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Операционная деятельность */}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell className="sticky left-0 bg-muted/50 border-r">Операционная деятельность</TableCell>
                {periodsToShow.map((period, index) => (
                  <TableCell key={index} className="text-right"></TableCell>
                ))}
              </TableRow>

              {/* Поступления от операционной деятельности */}
              <TableRow>
                <TableCell className="sticky left-0 bg-background border-r pl-4">Поступления от операционной деятельности</TableCell>
                {periodsToShow.map((period, index) => (
                  <TableCell key={index} className="text-right">
                    {formatAmount(periodCashFlowData[period.name]?.operationalIncome || 0)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Платежи по операционной деятельности */}
              <TableRow>
                <TableCell className="sticky left-0 bg-background border-r pl-4">Платежи по операционной деятельности</TableCell>
                {periodsToShow.map((period, index) => (
                  <TableCell key={index} className="text-right">
                    {formatAmount(-Object.values(periodCashFlowData[period.name]?.operationalExpenses || {}).reduce((sum, val) => sum + val, 0))}
                  </TableCell>
                ))}
              </TableRow>

              {/* Детализация расходов */}
              {expenseList.map((category, categoryIndex) => (
                <TableRow key={`expense-${categoryIndex}`}>
                  <TableCell className="sticky left-0 bg-background border-r pl-8 text-sm">(-) {category}</TableCell>
                  {periodsToShow.map((period, index) => (
                    <TableCell key={index} className="text-right text-sm">
                      {formatAmount(periodCashFlowData[period.name]?.operationalExpenses[category] || 0)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {/* Денежный поток от операционной деятельности */}
              <TableRow className="font-semibold bg-blue-50">
                <TableCell className="sticky left-0 bg-blue-50 border-r">Денежный поток от операционной деятельности</TableCell>
                {periodsToShow.map((period, index) => {
                  const data = periodCashFlowData[period.name];
                  const operationalFlow = (data?.operationalIncome || 0) - Object.values(data?.operationalExpenses || {}).reduce((sum, val) => sum + val, 0);
                  return (
                    <TableCell key={index} className="text-right font-semibold">
                      {formatAmount(operationalFlow)}
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Инвестиционная деятельность */}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell className="sticky left-0 bg-muted/50 border-r">Инвестиционная деятельность</TableCell>
                {periodsToShow.map((period, index) => (
                  <TableCell key={index} className="text-right"></TableCell>
                ))}
              </TableRow>

              <TableRow>
                <TableCell className="sticky left-0 bg-background border-r pl-4">Поступления от инвестиционной деятельности</TableCell>
                {periodsToShow.map((period, index) => (
                  <TableCell key={index} className="text-right">
                    {formatAmount(periodCashFlowData[period.name]?.investmentIncome || 0)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Денежный поток от инвестиционной деятельности */}
              <TableRow className="font-semibold bg-green-50">
                <TableCell className="sticky left-0 bg-green-50 border-r">Денежный поток от инвестиционной деятельности</TableCell>
                {periodsToShow.map((period, index) => (
                  <TableCell key={index} className="text-right font-semibold">
                    {formatAmount(periodCashFlowData[period.name]?.investmentIncome || 0)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Финансовая деятельность */}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell className="sticky left-0 bg-muted/50 border-r">Финансовая деятельность</TableCell>
                {periodsToShow.map((period, index) => (
                  <TableCell key={index} className="text-right"></TableCell>
                ))}
              </TableRow>

              <TableRow>
                <TableCell className="sticky left-0 bg-background border-r pl-4">Поступления от финансовой деятельности</TableCell>
                {periodsToShow.map((period, index) => (
                  <TableCell key={index} className="text-right">
                    {formatAmount(periodCashFlowData[period.name]?.financialIncome || 0)}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow>
                <TableCell className="sticky left-0 bg-background border-r pl-4">Платежи по финансовой деятельности</TableCell>
                {periodsToShow.map((period, index) => (
                  <TableCell key={index} className="text-right">
                    {formatAmount(-(periodCashFlowData[period.name]?.financialExpenses || 0))}
                  </TableCell>
                ))}
              </TableRow>

              {/* Денежный поток от финансовой деятельности */}
              <TableRow className="font-semibold bg-purple-50">
                <TableCell className="sticky left-0 bg-purple-50 border-r">Денежный поток от финансовой деятельности</TableCell>
                {periodsToShow.map((period, index) => {
                  const data = periodCashFlowData[period.name];
                  const financialFlow = (data?.financialIncome || 0) - (data?.financialExpenses || 0);
                  return (
                    <TableCell key={index} className="text-right font-semibold">
                      {formatAmount(financialFlow)}
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Общий денежный поток */}
              <TableRow className="font-bold bg-slate-100 border-t-2">
                <TableCell className="sticky left-0 bg-slate-100 border-r font-bold">Общий денежный поток за период</TableCell>
                {periodsToShow.map((period, index) => {
                  const data = periodCashFlowData[period.name];
                  const operationalFlow = (data?.operationalIncome || 0) - Object.values(data?.operationalExpenses || {}).reduce((sum, val) => sum + val, 0);
                  const investmentFlow = data?.investmentIncome || 0;
                  const financialFlow = (data?.financialIncome || 0) - (data?.financialExpenses || 0);
                  const totalFlow = operationalFlow + investmentFlow + financialFlow;
                  
                  return (
                    <TableCell key={index} className="text-right font-bold">
                      {formatAmount(totalFlow)}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};