import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { categoryColors } from './constants';

interface ABCKeyMetricsProps {
  categorySummary: Record<string, { count: number; sales_volume: number; revenue: number; profit: number }>;
  analysisType: 'sales_volume' | 'revenue' | 'profit';
  totals: { count: number; sales_volume: number; revenue: number; profit: number };
}

export const ABCKeyMetrics = ({ categorySummary, analysisType, totals }: ABCKeyMetricsProps) => {
  const categories = ['A', 'B', 'C'] as const;

  const getMetricValue = (category: string) => {
    const data = categorySummary[category];
    if (!data) return 0;
    return analysisType === 'sales_volume' ? data.sales_volume : data[analysisType];
  };

  const getPercentage = (category: string) => {
    const value = getMetricValue(category);
    const total = analysisType === 'sales_volume' ? totals.sales_volume : totals[analysisType];
    return total > 0 ? (value / total * 100) : 0;
  };

  const formatValue = (value: number) => {
    if (analysisType === 'sales_volume') {
      return value.toLocaleString() + ' шт.';
    }
    return value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
  };

  return (
    <div className="grid grid-cols-3 gap-6 mb-6">
      {categories.map(category => {
        const data = categorySummary[category];
        const value = getMetricValue(category);
        const percentage = getPercentage(category);
        
        return (
          <Card key={category} className="bg-gradient-to-br from-background to-muted/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge 
                  variant="outline"
                  className="text-sm font-semibold"
                  style={{ 
                    backgroundColor: categoryColors[category] + '20',
                    borderColor: categoryColors[category],
                    color: categoryColors[category]
                  }}
                >
                  Категория {category}
                </Badge>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: categoryColors[category] }}>
                    {percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">от итога</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="text-lg font-semibold">
                    {formatValue(value)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {analysisType === 'sales_volume' ? 'объем продаж' : 
                     analysisType === 'revenue' ? 'выручка' : 'прибыль'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-medium">{data?.count || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};