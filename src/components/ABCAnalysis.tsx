
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Package, DollarSign, BarChart3 } from 'lucide-react';

// Mock data for ABC analysis
const mockItemsData = [
  { id: '1', name: 'Товар A1', sales_volume: 1500, revenue: 75000, profit: 22500, category: 'A' },
  { id: '2', name: 'Товар A2', sales_volume: 1200, revenue: 60000, profit: 18000, category: 'A' },
  { id: '3', name: 'Товар A3', sales_volume: 1000, revenue: 50000, profit: 15000, category: 'A' },
  { id: '4', name: 'Товар B1', sales_volume: 800, revenue: 32000, profit: 9600, category: 'B' },
  { id: '5', name: 'Товар B2', sales_volume: 600, revenue: 24000, profit: 7200, category: 'B' },
  { id: '6', name: 'Товар B3', sales_volume: 500, revenue: 20000, profit: 6000, category: 'B' },
  { id: '7', name: 'Товар C1', sales_volume: 300, revenue: 9000, profit: 2700, category: 'C' },
  { id: '8', name: 'Товар C2', sales_volume: 200, revenue: 6000, profit: 1800, category: 'C' },
  { id: '9', name: 'Товар C3', sales_volume: 150, revenue: 4500, profit: 1350, category: 'C' },
  { id: '10', name: 'Товар C4', sales_volume: 100, revenue: 3000, profit: 900, category: 'C' },
];

const chartConfig = {
  sales_volume: {
    label: 'Объем продаж',
    color: 'hsl(var(--chart-1))',
  },
  revenue: {
    label: 'Выручка',
    color: 'hsl(var(--chart-2))',
  },
  profit: {
    label: 'Прибыль',
    color: 'hsl(var(--chart-3))',
  },
};

const categoryColors = {
  A: '#22c55e', // green
  B: '#f59e0b', // orange
  C: '#ef4444', // red
};

export const ABCAnalysis = () => {
  const [analysisType, setAnalysisType] = useState<'sales_volume' | 'revenue' | 'profit'>('revenue');

  // Calculate category summaries
  const categorySummary = mockItemsData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { count: 0, sales_volume: 0, revenue: 0, profit: 0 };
    }
    acc[item.category].count += 1;
    acc[item.category].sales_volume += item.sales_volume;
    acc[item.category].revenue += item.revenue;
    acc[item.category].profit += item.profit;
    return acc;
  }, {} as Record<string, { count: number; sales_volume: number; revenue: number; profit: number }>);

  const pieData = Object.entries(categorySummary).map(([category, data]) => ({
    name: `Категория ${category}`,
    value: data[analysisType],
    color: categoryColors[category as keyof typeof categoryColors],
  }));

  const sortedItems = [...mockItemsData].sort((a, b) => b[analysisType] - a[analysisType]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ABC Анализ</h2>
          <p className="text-gray-600">Категоризация товаров по объемам продаж, выручке и прибыли</p>
        </div>
        <Button>
          Экспорт анализа
        </Button>
      </div>

      <Tabs value={analysisType} onValueChange={(value) => setAnalysisType(value as typeof analysisType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales_volume" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>По объему продаж</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>По выручке</span>
          </TabsTrigger>
          <TabsTrigger value="profit" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>По прибыли</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={analysisType} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(categorySummary).map(([category, data]) => (
              <Card key={category}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Категория {category}
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    style={{ backgroundColor: categoryColors[category as keyof typeof categoryColors] + '20', borderColor: categoryColors[category as keyof typeof categoryColors] }}
                  >
                    {data.count} товаров
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysisType === 'sales_volume' 
                      ? data.sales_volume.toLocaleString()
                      : data[analysisType].toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analysisType === 'sales_volume' ? 'единиц продано' : 
                     analysisType === 'revenue' ? 'общая выручка' : 'общая прибыль'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Распределение по категориям</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Топ товары</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedItems.slice(0, 5)} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey={analysisType} 
                        fill={chartConfig[analysisType].color}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Детальный анализ товаров</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Товар</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Объем продаж</TableHead>
                    <TableHead>Выручка</TableHead>
                    <TableHead>Прибыль</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          style={{ 
                            backgroundColor: categoryColors[item.category as keyof typeof categoryColors] + '20', 
                            borderColor: categoryColors[item.category as keyof typeof categoryColors] 
                          }}
                        >
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.sales_volume.toLocaleString()}</TableCell>
                      <TableCell>{item.revenue.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</TableCell>
                      <TableCell>{item.profit.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
