
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { useCostData } from '@/hooks/useCostData';

export const CostTable = () => {
  const { costs, deleteCost, isLoading, isDeleting } = useCostData();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Загрузка...</div>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = costs.reduce((sum, cost) => sum + Number(cost.total_amount), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Журнал затрат
          <Badge variant="outline">
            Всего: {totalAmount.toLocaleString('ru-RU')} ₽
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {costs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Затраты не найдены. Добавьте первую запись или загрузите файл.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата загрузки</TableHead>
                  <TableHead>Название файла</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>
                      {new Date(cost.upload_date).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {cost.file_name}
                    </TableCell>
                    <TableCell className="font-medium">
                      {Number(cost.total_amount).toLocaleString('ru-RU')} ₽
                    </TableCell>
                    <TableCell>
                      <Badge variant={cost.status === 'processed' ? 'default' : 'secondary'}>
                        {cost.status === 'processed' ? 'Обработан' : 'В обработке'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCost(cost.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
