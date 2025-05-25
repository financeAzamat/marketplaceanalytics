
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
import { TrendingUp, Package, DollarSign, BarChart3, Loader2 } from 'lucide-react';
import { useABCAnalysis } from '@/hooks/useABCAnalysis';

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
  const { abcItems, categorySummary, isLoading } = useABCAnalysis(analysisType);

  const pieData = Object.entries(categorySummary).map(([category, data]) => ({
    name: `Категория ${category}`,
    value: data[analysisType],
    color: categoryColors[category as keyof typeof categoryColors],
  }));

  const topItems = abcItems.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Загрузка ABC анализа...</span>
      </div>
    );
  }

  if (abcItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">ABC Анализ</h2>
            <p className="text-gray-600">Категоризация товаров по объемам продаж, выручке и прибыли</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет данных для анализа</h3>
              <p className="text-gray-500">Синхронизируйте данные с маркетплейсами для проведения ABC анализа</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    <BarChart data={topItems} layout="horizontal">
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
                    <TableHead>Маркетплейс</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Объем продаж</TableHead>
                    <TableHead>Выручка</TableHead>
                    <TableHead>Прибыль</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {abcItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.marketplace}</TableCell>
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
