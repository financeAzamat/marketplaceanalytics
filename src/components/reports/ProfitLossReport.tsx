import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface ProfitLossReportProps {
  reportId: string;
  reportName: string;
  dateFrom: Date;
  dateTo: Date;
  marketplace?: string;
  periods: Array<{
    name: string;
    dateFrom: Date;
    dateTo: Date;
  }>;
}

interface PeriodData {
  [key: string]: {
    revenues: { [key: string]: number };
    expenses: { [key: string]: number };
    cogs: { [key: string]: number };
  };
}

export const ProfitLossReport = ({ reportId, reportName, dateFrom, dateTo, marketplace, periods }: ProfitLossReportProps) => {
  const [periodData, setPeriodData] = useState<PeriodData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeriodData = async () => {
      const data: PeriodData = {};
      
      // If no periods specified, create a single period for the entire range
      const periodsToProcess = periods.length > 0 ? periods : [{
        name: 'Общий период',
        dateFrom,
        dateTo
      }];

      for (const period of periodsToProcess) {
        // Fetch revenue data
        const { data: revenueData } = await supabase
          .from('payment_journal')
          .select('*')
          .gte('payment_date', period.dateFrom.toISOString().split('T')[0])
          .lte('payment_date', period.dateTo.toISOString().split('T')[0]);

        // Fetch expense data
        const { data: expenseData } = await supabase
          .from('expense_journal')
          .select('*')
          .gte('expense_date', period.dateFrom.toISOString().split('T')[0])
          .lte('expense_date', period.dateTo.toISOString().split('T')[0]);

        // Fetch COGS data
        const { data: cogsData } = await supabase
          .from('cogs_entries')
          .select('*')
          .gte('date_from', period.dateFrom.toISOString().split('T')[0])
          .lte('date_to', period.dateTo.toISOString().split('T')[0]);

        // Process data for this period
        const revenues: { [key: string]: number } = {};
        revenueData?.forEach(item => {
          const key = item.marketplace || 'Прочее';
          revenues[key] = (revenues[key] || 0) + Number(item.amount);
        });

        const expenses: { [key: string]: number } = {};
        expenseData?.forEach(item => {
          const key = `${item.marketplace || 'Прочее'}_${item.category}`;
          expenses[key] = (expenses[key] || 0) + Number(item.amount);
        });

        const cogs: { [key: string]: number } = {};
        cogsData?.forEach(item => {
          const key = item.marketplace || 'Прочее';
          cogs[key] = (cogs[key] || 0) + Number(item.unit_cost);
        });

        data[period.name] = { revenues, expenses, cogs };
      }

      setPeriodData(data);
      setLoading(false);
    };

    fetchPeriodData();
  }, [dateFrom, dateTo, marketplace, periods]);

  const getMarketplaceRevenue = (periodName: string, marketplace: string) => {
    return periodData[periodName]?.revenues[marketplace] || 0;
  };

  const getMarketplaceExpense = (periodName: string, marketplace: string, category: string) => {
    return periodData[periodName]?.expenses[`${marketplace}_${category}`] || 0;
  };

  const getMarketplaceCOGS = (periodName: string, marketplace: string) => {
    return periodData[periodName]?.cogs[marketplace] || 0;
  };

  if (loading) {
    return <div>Загрузка отчета...</div>;
  }

  const periodsToShow = periods.length > 0 ? periods : [{
    name: 'Общий период',
    dateFrom,
    dateTo
  }];

  // Report structure data
  const reportStructure = [
    {
      title: "Выручка",
      type: "header",
      children: [
        { title: "Wildberries", type: "item", getValue: (period: string) => getMarketplaceRevenue(period, 'Wildberries') },
        { title: "Ozon", type: "item", getValue: (period: string) => getMarketplaceRevenue(period, 'Ozon') }
      ]
    },
    {
      title: "Прямые расходы по маркетплейсам",
      type: "header",
      children: [
        {
          title: "Wildberries",
          type: "subheader",
          children: [
            { title: "Возвраты", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Wildberries', 'Возвраты') },
            { title: "Себестоимость", type: "item", getValue: (period: string) => getMarketplaceCOGS(period, 'Wildberries') },
            { title: "Расходы на расчетно-кассовое обслуживание", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Wildberries', 'Расходы на расчетно-кассовое обслуживание') },
            { title: "Фонд оплаты труда", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Wildberries', 'Фонд оплаты труда') },
            { title: "Образцы; Лекала", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Wildberries', 'Образцы; Лекала') },
            { title: "Внешняя логистика", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Wildberries', 'Внешняя логистика') },
            { title: "Приемка товара", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Wildberries', 'Приемка товара') },
            { title: "Штрафы", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Wildberries', 'Штрафы') },
            { title: "Штраф за смену характеристик", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Wildberries', 'Штраф за смену характеристик') },
            { title: "Штрафах за отсутствие обязательной маркировки", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Wildberries', 'Штрафах за отсутствие обязательной маркировки') },
            { title: "Продвижение товара", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Wildberries', 'Продвижение товара') },
            { title: "Создание контента", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Wildberries', 'Создание контента') },
            { title: "Расходный материал", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Wildberries', 'Расходный материал') },
            { title: "Честный Знак; КиЗы; Гос. Пошлины", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Wildberries', 'Честный Знак; КиЗы; Гос. Пошлины') }
          ]
        },
        {
          title: "Ozon",
          type: "subheader",
          children: [
            { title: "Возвраты", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Ozon', 'Возвраты') },
            { title: "Себестоимость", type: "item", getValue: (period: string) => getMarketplaceCOGS(period, 'Ozon') },
            { title: "Расходы на расчетно-кассовое обслуживание", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Ozon', 'Расходы на расчетно-кассовое обслуживание') },
            { title: "Фонд оплаты труда", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Ozon', 'Фонд оплаты труда') },
            { title: "Образцы; Лекала", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Ozon', 'Образцы; Лекала') },
            { title: "Внешняя логистика", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Ozon', 'Внешняя логистика') },
            { title: "Комиссии", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Ozon', 'Комиссии') },
            { title: "Комиссия за возврат", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Ozon', 'Комиссия за возврат') },
            { title: "Комиссия за доставку", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Ozon', 'Комиссия за доставку') },
            { title: "Продвижение товара", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Ozon', 'Продвижение товара') },
            { title: "Создание контента", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Ozon', 'Создание контента') },
            { title: "Расходный материал", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Ozon', 'Расходный материал') },
            { title: "Честный Знак; КиЗы; Гос. Пошлины", type: "item", getValue: (period: string) => getMarketplaceExpense(period, 'Ozon', 'Честный Знак; КиЗы; Гос. Пошлины') }
          ]
        }
      ]
    }
  ];

  const renderRow = (item: any, level: number = 0) => {
    const paddingClass = level === 0 ? '' : level === 1 ? 'pl-4' : 'pl-8';
    const rowClass = item.type === 'header' ? 'font-semibold bg-muted/50' : item.type === 'subheader' ? 'font-medium' : '';

    return (
      <TableRow key={item.title} className={rowClass}>
        <TableCell className={paddingClass}>{item.title}</TableCell>
        {periodsToShow.map((period, index) => (
          <TableCell key={index} className="text-right">
            {item.getValue ? item.getValue(period.name).toLocaleString() : ''}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{reportName} - Отчет о прибылях и убытках</CardTitle>
        <p className="text-muted-foreground">
          Период: {dateFrom.toLocaleDateString('ru-RU')} - {dateTo.toLocaleDateString('ru-RU')}
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[300px]">Наименование статьи</TableHead>
              {periodsToShow.map((period, index) => (
                <TableHead key={index} className="text-right min-w-[120px]">
                  {period.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportStructure.map(section => (
              <>
                {renderRow(section, 0)}
                {section.children?.map((child: any) => (
                  <>
                    {renderRow(child, 1)}
                    {child.children?.map((subChild: any) => renderRow(subChild, 2))}
                  </>
                ))}
              </>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};