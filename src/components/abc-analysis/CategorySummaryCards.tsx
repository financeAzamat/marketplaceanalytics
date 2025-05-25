
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { categoryColors } from './constants';

interface CategorySummaryCardsProps {
  categorySummary: Record<string, { count: number; sales_volume: number; revenue: number; profit: number }>;
  analysisType: 'sales_volume' | 'revenue' | 'profit';
}

export const CategorySummaryCards = ({ categorySummary, analysisType }: CategorySummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(categorySummary).map(([category, data]) => (
        <Card key={category}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Категория {category}
            </CardTitle>
            <Badge 
              variant="outline" 
              style={{ 
                backgroundColor: categoryColors[category as keyof typeof categoryColors] + '20', 
                borderColor: categoryColors[category as keyof typeof categoryColors] 
              }}
            >
              {data.count} записей
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
  );
};
