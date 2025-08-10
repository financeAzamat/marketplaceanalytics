import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronRight, TableIcon } from 'lucide-react';
import { ABCItem } from '@/hooks/useABCAnalysis';
import { categoryColors } from './constants';

interface ABCExpandableTableProps {
  abcItems: ABCItem[];
  analysisType: 'sales_volume' | 'revenue' | 'profit';
}

export const ABCExpandableTable = ({ abcItems, analysisType }: ABCExpandableTableProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['A']));
  const [itemsPerCategory, setItemsPerCategory] = useState<Record<string, number>>({
    A: 5,
    B: 5,
    C: 5
  });

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const loadMoreItems = (category: string) => {
    setItemsPerCategory(prev => ({
      ...prev,
      [category]: prev[category] + 10
    }));
  };

  const formatValue = (value: number) => {
    if (analysisType === 'sales_volume') {
      return value.toLocaleString() + ' шт.';
    }
    return value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
  };

  const groupedItems = abcItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ABCItem[]>);

  const categories = ['A', 'B', 'C'] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TableIcon className="h-5 w-5" />
          <span>Детализация по категориям</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map(category => {
            const items = groupedItems[category] || [];
            const visibleItems = items.slice(0, itemsPerCategory[category]);
            const hasMore = items.length > itemsPerCategory[category];
            const isExpanded = expandedCategories.has(category);

            return (
              <div key={category} className="border rounded-lg">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <Badge 
                      variant="outline"
                      style={{ 
                        backgroundColor: categoryColors[category] + '20',
                        borderColor: categoryColors[category],
                        color: categoryColors[category]
                      }}
                    >
                      Категория {category}
                    </Badge>
                    <span className="font-medium">{items.length} позиций</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatValue(items.reduce((sum, item) => sum + item[analysisType], 0))}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Название</TableHead>
                          <TableHead>Маркетплейс</TableHead>
                          <TableHead className="text-right">Объем продаж</TableHead>
                          <TableHead className="text-right">Выручка</TableHead>
                          <TableHead className="text-right">Прибыль</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium max-w-xs">
                              <div className="truncate" title={item.name}>
                                {item.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {item.marketplace}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {item.sales_volume.toLocaleString()} шт.
                            </TableCell>
                            <TableCell className="text-right">
                              {item.revenue.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.profit.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {hasMore && (
                      <div className="p-4 text-center border-t">
                        <Button 
                          variant="ghost" 
                          onClick={() => loadMoreItems(category)}
                        >
                          Показать еще ({items.length - itemsPerCategory[category]} позиций)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};