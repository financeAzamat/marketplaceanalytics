import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface ProfitLossReportProps {
  reportId: string;
  reportName: string;
  month: number;
  year: number;
  marketplace?: string;
}

interface ReportData {
  revenues: { [key: string]: number };
  expenses: { [key: string]: number };
  cogs: { [key: string]: number };
}

export const ProfitLossReport = ({ reportId, reportName, month, year, marketplace }: ProfitLossReportProps) => {
  const [data, setData] = useState<ReportData>({ revenues: {}, expenses: {}, cogs: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      // Fetch revenue data (from payment_journal)
      const { data: revenueData } = await supabase
        .from('payment_journal')
        .select('*')
        .gte('payment_date', startDate.toISOString().split('T')[0])
        .lte('payment_date', endDate.toISOString().split('T')[0]);

      // Fetch expense data
      const { data: expenseData } = await supabase
        .from('expense_journal')
        .select('*')
        .gte('expense_date', startDate.toISOString().split('T')[0])
        .lte('expense_date', endDate.toISOString().split('T')[0]);

      // Fetch COGS data
      const { data: cogsData } = await supabase
        .from('cogs_entries')
        .select('*')
        .gte('date_from', startDate.toISOString().split('T')[0])
        .lte('date_to', endDate.toISOString().split('T')[0]);

      // Process revenue data
      const revenues: { [key: string]: number } = {};
      revenueData?.forEach(item => {
        const key = item.marketplace || 'Прочее';
        revenues[key] = (revenues[key] || 0) + Number(item.amount);
      });

      // Process expense data
      const expenses: { [key: string]: number } = {};
      expenseData?.forEach(item => {
        const key = `${item.marketplace || 'Прочее'}_${item.category}`;
        expenses[key] = (expenses[key] || 0) + Number(item.amount);
      });

      // Process COGS data
      const cogs: { [key: string]: number } = {};
      cogsData?.forEach(item => {
        const key = item.marketplace || 'Прочее';
        cogs[key] = (cogs[key] || 0) + Number(item.unit_cost);
      });

      setData({ revenues, expenses, cogs });
      setLoading(false);
    };

    fetchData();
  }, [month, year, marketplace]);

  const getMarketplaceRevenue = (marketplace: string) => {
    return data.revenues[marketplace] || 0;
  };

  const getMarketplaceExpense = (marketplace: string, category: string) => {
    return data.expenses[`${marketplace}_${category}`] || 0;
  };

  const getMarketplaceCOGS = (marketplace: string) => {
    return data.cogs[marketplace] || 0;
  };

  // Direct expense categories for Wildberries
  const wildberriesDirectCategories = [
    'Возвраты', 'Расходы на расчетно-кассовое обслуживание', 'Фонд оплаты труда',
    'Образцы; Лекала', 'Внешняя логистика', 'Приемка товара', 'Штрафы',
    'Штраф за смену характеристик', 'Штрафах за отсутствие обязательной маркировки',
    'Продвижение товара', 'Создание контента', 'Расходный материал',
    'Честный Знак; КиЗы; Гос. Пошлины'
  ];

  // Direct expense categories for Ozon
  const ozonDirectCategories = [
    'Возвраты', 'Расходы на расчетно-кассовое обслуживание', 'Фонд оплаты труда',
    'Образцы; Лекала', 'Внешняя логистика', 'Комиссии', 'Комиссия за возврат',
    'Комиссия за доставку', 'Продвижение товара', 'Создание контента',
    'Расходный материал', 'Честный Знак; КиЗы; Гос. Пошлины'
  ];

  // Indirect expense categories
  const indirectCategories = [
    'Представительские расходы', 'Основные средства', 'HR',
    'Расходы на расчетно-кассовое обслуживание', 'Фонд оплаты труда', 'Аренда',
    'Внешняя логистика', 'Сервисы; Программное обеспечение', 'Связь и интернет',
    'Услуги Фулфилмента', 'Регистрация ИП', 'Расходный материал',
    'Честный Знак; КиЗы; Гос. Пошлины', 'Сертификация и регистрация торговых марок',
    'Продвижение товара', 'Создание контента'
  ];

  const calculateDirectExpenses = (marketplace: string) => {
    const categories = marketplace === 'Wildberries' ? wildberriesDirectCategories : ozonDirectCategories;
    return categories.reduce((sum, category) => sum + getMarketplaceExpense(marketplace, category), 0);
  };

  const calculateOperationalProfit = (marketplace: string) => {
    const revenue = getMarketplaceRevenue(marketplace);
    const directExpenses = calculateDirectExpenses(marketplace);
    const cogs = getMarketplaceCOGS(marketplace);
    return revenue - directExpenses - cogs;
  };

  const calculateMarketplaceProfit = (marketplace: string) => {
    const operationalProfit = calculateOperationalProfit(marketplace);
    const indirectExpenses = [
      'Представительские расходы', 'Основные средства', 'HR', 'Аренда',
      'Сервисы; Программное обеспечение', 'Связь и интернет', 'Услуги Фулфилмента',
      'Регистрация ИП', 'Сертификация и регистрация торговых марок'
    ].reduce((sum, category) => sum + getMarketplaceExpense(marketplace, category), 0);
    
    return operationalProfit - indirectExpenses;
  };

  if (loading) {
    return <div>Загрузка отчета...</div>;
  }

  const wildberriesRevenue = getMarketplaceRevenue('Wildberries');
  const ozonRevenue = getMarketplaceRevenue('Ozon');
  const totalRevenue = wildberriesRevenue + ozonRevenue;

  const wildberriesOperationalProfit = calculateOperationalProfit('Wildberries');
  const ozonOperationalProfit = calculateOperationalProfit('Ozon');

  const wildberriesMarketplaceProfit = calculateMarketplaceProfit('Wildberries');
  const ozonMarketplaceProfit = calculateMarketplaceProfit('Ozon');

  const otherExpenses = [
    'Представительские расходы', 'Основные средства', 'HR', 'Расходы на расчетно-кассовое обслуживание',
    'Фонд оплаты труда', 'Аренда', 'Внешняя логистика', 'Сервисы; Программное обеспечение',
    'Связь и интернет', 'Услуги Фулфилмента', 'Регистрация ИП', 'Расходный материал',
    'Честный Знак; КиЗы; Гос. Пошлины', 'Сертификация и регистрация торговых марок',
    'Продвижение товара', 'Создание контента'
  ].reduce((sum, category) => sum + getMarketplaceExpense('Прочее', category), 0);

  const profitBeforeTax = wildberriesMarketplaceProfit + ozonMarketplaceProfit - otherExpenses;
  const taxes = getMarketplaceExpense('Прочее', 'Налоги и пошлины');
  const otherPayments = getMarketplaceExpense('Прочее', 'Прочие платежи');
  const ownerContributions = getMarketplaceExpense('Прочее', 'Поступления от собственика');
  
  const netProfit = profitBeforeTax - taxes - otherPayments + ownerContributions;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{reportName} - Отчет о прибылях и убытках</CardTitle>
        <p className="text-muted-foreground">
          Период: {month.toString().padStart(2, '0')}.{year}
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/3">Наименование статьи</TableHead>
              <TableHead className="text-right">Сумма, ₽</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="font-semibold bg-muted/50">
              <TableCell>Выручка</TableCell>
              <TableCell className="text-right">{totalRevenue.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Wildberries</TableCell>
              <TableCell className="text-right">{wildberriesRevenue.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Ozon</TableCell>
              <TableCell className="text-right">{ozonRevenue.toLocaleString()}</TableCell>
            </TableRow>

            <TableRow className="font-semibold bg-muted/50">
              <TableCell>Прямые расходы по маркетплейсам</TableCell>
              <TableCell className="text-right">
                {(calculateDirectExpenses('Wildberries') + calculateDirectExpenses('Ozon') + getMarketplaceCOGS('Wildberries') + getMarketplaceCOGS('Ozon')).toLocaleString()}
              </TableCell>
            </TableRow>
            
            <TableRow className="font-medium">
              <TableCell className="pl-4">Wildberries</TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            {['Возвраты', 'Себестоимость', 'Расходы на расчетно-кассовое обслуживание', 'Фонд оплаты труда', 'Образцы; Лекала', 'Внешняя логистика', 'Приемка товара', 'Штрафы', 'Штраф за смену характеристик', 'Штрафах за отсутствие обязательной маркировки', 'Продвижение товара', 'Создание контента', 'Расходный материал', 'Честный Знак; КиЗы; Гос. Пошлины'].map(category => (
              <TableRow key={`wb-${category}`}>
                <TableCell className="pl-8">{category}</TableCell>
                <TableCell className="text-right">
                  {category === 'Себестоимость' ? getMarketplaceCOGS('Wildberries').toLocaleString() : getMarketplaceExpense('Wildberries', category).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}

            <TableRow className="font-medium">
              <TableCell className="pl-4">Ozon</TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            {['Возвраты', 'Себестоимость', 'Расходы на расчетно-кассовое обслуживание', 'Фонд оплаты труда', 'Образцы; Лекала', 'Внешняя логистика', 'Комиссии', 'Комиссия за возврат', 'Комиссия за доставку', 'Продвижение товара', 'Создание контента', 'Расходный материал', 'Честный Знак; КиЗы; Гос. Пошлины'].map(category => (
              <TableRow key={`ozon-${category}`}>
                <TableCell className="pl-8">{category}</TableCell>
                <TableCell className="text-right">
                  {category === 'Себестоимость' ? getMarketplaceCOGS('Ozon').toLocaleString() : getMarketplaceExpense('Ozon', category).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}

            <TableRow className="font-semibold bg-muted/50">
              <TableCell>Операционная прибыль</TableCell>
              <TableCell className="text-right">{(wildberriesOperationalProfit + ozonOperationalProfit).toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Wildberries</TableCell>
              <TableCell className="text-right">{wildberriesOperationalProfit.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Ozon</TableCell>
              <TableCell className="text-right">{ozonOperationalProfit.toLocaleString()}</TableCell>
            </TableRow>

            <TableRow className="font-semibold bg-muted/50">
              <TableCell>Рентабельность по операционной прибыли</TableCell>
              <TableCell className="text-right">
                {totalRevenue > 0 ? ((wildberriesOperationalProfit + ozonOperationalProfit) / totalRevenue * 100).toFixed(1) + '%' : '0%'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Wildberries</TableCell>
              <TableCell className="text-right">
                {wildberriesRevenue > 0 ? (wildberriesOperationalProfit / wildberriesRevenue * 100).toFixed(1) + '%' : '0%'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Ozon</TableCell>
              <TableCell className="text-right">
                {ozonRevenue > 0 ? (ozonOperationalProfit / ozonRevenue * 100).toFixed(1) + '%' : '0%'}
              </TableCell>
            </TableRow>

            <TableRow className="font-semibold bg-muted/50">
              <TableCell>Косвенные расходы</TableCell>
              <TableCell className="text-right">
                {(indirectCategories.reduce((sum, category) => sum + getMarketplaceExpense('Wildberries', category) + getMarketplaceExpense('Ozon', category), 0)).toLocaleString()}
              </TableCell>
            </TableRow>
            
            <TableRow className="font-medium">
              <TableCell className="pl-4">Wildberries</TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            {indirectCategories.map(category => (
              <TableRow key={`wb-indirect-${category}`}>
                <TableCell className="pl-8">{category}</TableCell>
                <TableCell className="text-right">{getMarketplaceExpense('Wildberries', category).toLocaleString()}</TableCell>
              </TableRow>
            ))}

            <TableRow className="font-medium">
              <TableCell className="pl-4">Ozon</TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            {indirectCategories.map(category => (
              <TableRow key={`ozon-indirect-${category}`}>
                <TableCell className="pl-8">{category}</TableCell>
                <TableCell className="text-right">{getMarketplaceExpense('Ozon', category).toLocaleString()}</TableCell>
              </TableRow>
            ))}

            <TableRow className="font-semibold bg-muted/50">
              <TableCell>Прибыль маркетплейсов</TableCell>
              <TableCell className="text-right">{(wildberriesMarketplaceProfit + ozonMarketplaceProfit).toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Wildberries</TableCell>
              <TableCell className="text-right">{wildberriesMarketplaceProfit.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Ozon</TableCell>
              <TableCell className="text-right">{ozonMarketplaceProfit.toLocaleString()}</TableCell>
            </TableRow>

            <TableRow className="font-semibold bg-muted/50">
              <TableCell>Рентабельность прибыли маркетплейсов</TableCell>
              <TableCell className="text-right">
                {totalRevenue > 0 ? ((wildberriesMarketplaceProfit + ozonMarketplaceProfit) / totalRevenue * 100).toFixed(1) + '%' : '0%'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Wildberries</TableCell>
              <TableCell className="text-right">
                {wildberriesRevenue > 0 ? (wildberriesMarketplaceProfit / wildberriesRevenue * 100).toFixed(1) + '%' : '0%'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Ozon</TableCell>
              <TableCell className="text-right">
                {ozonRevenue > 0 ? (ozonMarketplaceProfit / ozonRevenue * 100).toFixed(1) + '%' : '0%'}
              </TableCell>
            </TableRow>

            <TableRow className="font-semibold bg-muted/50">
              <TableCell>Расходы прочих направлений</TableCell>
              <TableCell className="text-right">{otherExpenses.toLocaleString()}</TableCell>
            </TableRow>

            <TableRow className="font-semibold bg-muted/50">
              <TableCell>Прибыль до налогов</TableCell>
              <TableCell className="text-right">{profitBeforeTax.toLocaleString()}</TableCell>
            </TableRow>

            <TableRow className="font-semibold bg-muted/50">
              <TableCell>Рентабельность</TableCell>
              <TableCell className="text-right">
                {totalRevenue > 0 ? (profitBeforeTax / totalRevenue * 100).toFixed(1) + '%' : '0%'}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Налоги и пошлины</TableCell>
              <TableCell className="text-right">-{taxes.toLocaleString()}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Прочие платежи</TableCell>
              <TableCell className="text-right">-{otherPayments.toLocaleString()}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Поступления от собственика</TableCell>
              <TableCell className="text-right">{ownerContributions.toLocaleString()}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Продажа активов</TableCell>
              <TableCell className="text-right">{getMarketplaceExpense('Прочее', 'Продажа активов').toLocaleString()}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Прочие поступления</TableCell>
              <TableCell className="text-right">{getMarketplaceExpense('Прочее', 'Прочие поступления').toLocaleString()}</TableCell>
            </TableRow>

            <TableRow className="font-semibold bg-primary/10">
              <TableCell>Чистая прибыль</TableCell>
              <TableCell className="text-right font-bold">{netProfit.toLocaleString()}</TableCell>
            </TableRow>

            <TableRow className="font-semibold bg-muted/50">
              <TableCell>Рентабельность по чистой прибыли</TableCell>
              <TableCell className="text-right">
                {totalRevenue > 0 ? (netProfit / totalRevenue * 100).toFixed(1) + '%' : '0%'}
              </TableCell>
            </TableRow>

            <TableRow className="font-semibold bg-muted/50">
              <TableCell>Дивиденды из чистой прибыли</TableCell>
              <TableCell className="text-right">{getMarketplaceExpense('Прочее', 'Дивиденды').toLocaleString()}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="pl-8">Дивиденды</TableCell>
              <TableCell className="text-right">{getMarketplaceExpense('Прочее', 'Дивиденды').toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};