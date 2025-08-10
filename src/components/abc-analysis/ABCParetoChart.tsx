import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { ABCItem } from '@/hooks/useABCAnalysis';
import { categoryColors } from './constants';

interface ABCParetoChartProps {
  abcItems: ABCItem[];
  analysisType: 'sales_volume' | 'revenue' | 'profit';
}

export const ABCParetoChart = ({ abcItems, analysisType }: ABCParetoChartProps) => {
  // Подготавливаем данные для диаграммы Парето
  const sortedItems = [...abcItems].sort((a, b) => b[analysisType] - a[analysisType]);
  const totalValue = sortedItems.reduce((sum, item) => sum + item[analysisType], 0);
  
  let cumulativeValue = 0;
  const paretoData = sortedItems.slice(0, 20).map((item, index) => {
    cumulativeValue += item[analysisType];
    const cumulativePercentage = (cumulativeValue / totalValue) * 100;
    
    return {
      name: `${index + 1}`,
      value: item[analysisType],
      cumulative: cumulativePercentage,
      category: item.category,
      fullName: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name
    };
  });

  const formatValue = (value: number) => {
    if (analysisType === 'sales_volume') {
      return value.toLocaleString();
    }
    return (value / 1000).toFixed(0) + 'k ₽';
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Диаграмма Парето</span>
          <span className="text-sm text-muted-foreground ml-2">
            (Топ-20 по {analysisType === 'sales_volume' ? 'объему' : analysisType === 'revenue' ? 'выручке' : 'прибыли'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={paretoData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = paretoData[parseInt(label) - 1];
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data?.fullName}</p>
                        <p className="text-sm">
                          <span style={{ color: categoryColors[data?.category as keyof typeof categoryColors] }}>
                            Категория {data?.category}
                          </span>
                        </p>
                        <p className="text-sm">
                          Значение: {formatValue(payload[0]?.value as number)}
                        </p>
                        <p className="text-sm">
                          Накопленный %: {(payload[1]?.value as number)?.toFixed(1)}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              <Bar 
                yAxisId="left"
                dataKey="value" 
                fill="#8884d8"
                name="Значение"
                radius={[2, 2, 0, 0]}
              />
              
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="cumulative" 
                stroke="#ff7300" 
                strokeWidth={3}
                dot={{ fill: '#ff7300', r: 4 }}
                name="Накопленный %"
              />
              
              {/* Линии для обозначения границ категорий */}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey={() => 80} 
                stroke="#22c55e" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Граница A (80%)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey={() => 95} 
                stroke="#f59e0b" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Граница B (95%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};