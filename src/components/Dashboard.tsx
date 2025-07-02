
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Currency, ShoppingCart, Upload } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useSalesData } from '@/hooks/useSalesData';
import { useCostData } from '@/hooks/useCostData';
import { useMarketplaceConnections } from '@/hooks/useMarketplaceConnections';
import { useDataSync } from '@/hooks/useDataSync';
import { MarketplaceConnection } from './MarketplaceConnection';
import { DashboardFilters } from './DashboardFilters';

export const Dashboard = () => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [marketplace, setMarketplace] = useState<string>('all');
  
  const { salesData, isLoading: salesLoading } = useSalesData(
    dateFrom?.toISOString().split('T')[0],
    dateTo?.toISOString().split('T')[0],
    marketplace
  );
  const { costs, isLoading: costLoading } = useCostData();
  const { getConnectionStatus } = useMarketplaceConnections();
  const { syncAllMarketplaces } = useDataSync();

  // Calculate metrics from real data
  const totalRevenue = salesData.reduce((sum, item) => sum + Number(item.revenue), 0);
  const totalProfit = salesData.reduce((sum, item) => sum + Number(item.profit), 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders_count, 0);
  const totalCosts = costs.reduce((sum, item) => sum + Number(item.total_amount), 0);

  // Prepare chart data
  const revenueData = salesData.slice(0, 7).reverse().map(item => ({
    date: new Date(item.sale_date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
    wildberries: item.marketplace === 'WB' ? Number(item.revenue) : 0,
    ozon: item.marketplace === 'OZON' ? Number(item.revenue) : 0,
  }));

  const profitData = salesData.slice(0, 7).reverse().map(item => ({
    date: new Date(item.sale_date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
    profit: Number(item.profit),
  }));

  const handleApplyFilters = () => {
    // Trigger sync with new date parameters
    if (dateFrom || dateTo) {
      syncAllMarketplaces(
        dateFrom?.toISOString().split('T')[0],
        dateTo?.toISOString().split('T')[0]
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketplaceConnection
          marketplace="wildberries"
          name="Wildberries"
          description="Подключите ваш аккаунт Wildberries для автоматической синхронизации данных о продажах"
        />
        <MarketplaceConnection
          marketplace="ozon"
          name="Ozon"
          description="Подключите ваш аккаунт Ozon для получения актуальной статистики продаж"
        />
      </div>

      {/* Filters */}
      <DashboardFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        marketplace={marketplace}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onMarketplaceChange={setMarketplace}
        onApplyFilters={handleApplyFilters}
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium opacity-90">Выручка</CardTitle>
              <Currency className="h-4 w-4 opacity-75" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesLoading ? "..." : `${totalRevenue.toLocaleString('ru-RU')} ₽`}
            </div>
            <p className="text-xs opacity-75 mt-1">
              {marketplace === 'all' ? 'Все маркетплейсы' : 
               marketplace === 'WB' ? 'Wildberries' : 'Ozon'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium opacity-90">Прибыль</CardTitle>
              <TrendingUp className="h-4 w-4 opacity-75" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesLoading ? "..." : `${totalProfit.toLocaleString('ru-RU')} ₽`}
            </div>
            <p className="text-xs opacity-75 mt-1">
              {marketplace === 'all' ? 'Все маркетплейсы' : 
               marketplace === 'WB' ? 'Wildberries' : 'Ozon'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium opacity-90">Заказы</CardTitle>
              <ShoppingCart className="h-4 w-4 opacity-75" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesLoading ? "..." : totalOrders.toLocaleString('ru-RU')}
            </div>
            <p className="text-xs opacity-75 mt-1">
              {marketplace === 'all' ? 'Все маркетплейсы' : 
               marketplace === 'WB' ? 'Wildberries' : 'Ozon'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium opacity-90">Расходы</CardTitle>
              <Upload className="h-4 w-4 opacity-75" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {costLoading ? "..." : `${totalCosts.toLocaleString('ru-RU')} ₽`}
            </div>
            <p className="text-xs opacity-75 mt-1">Загружено файлов: {costs.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Выручка по маркетплейсам</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₽`, '']} />
                <Bar dataKey="wildberries" fill="#8884d8" name="Wildberries" />
                <Bar dataKey="ozon" fill="#82ca9d" name="Ozon" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Динамика прибыли</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₽`, 'Прибыль']} />
                <Line type="monotone" dataKey="profit" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
