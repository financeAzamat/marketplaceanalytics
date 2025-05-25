
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { ABCItem } from '@/hooks/useABCAnalysis';
import { categoryColors } from './constants';

interface ABCDataTableProps {
  abcItems: ABCItem[];
  totals: { count: number; sales_volume: number; revenue: number; profit: number };
}

export const ABCDataTable = ({ abcItems, totals }: ABCDataTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Детальный анализ записей продаж</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Запись</TableHead>
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
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="font-bold">Итого ({totals.count} записей)</TableCell>
              <TableCell className="font-bold">{totals.sales_volume.toLocaleString()}</TableCell>
              <TableCell className="font-bold">{totals.revenue.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</TableCell>
              <TableCell className="font-bold">{totals.profit.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
};
