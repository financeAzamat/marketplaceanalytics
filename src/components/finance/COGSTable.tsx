import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { useCOGSEntries } from '@/hooks/useCOGSEntries';

const MARKETPLACE_LABELS = {
  wb: 'WB',
  ozon: 'Ozon',
};

export const COGSTable = () => {
  const { cogsEntries, deleteCOGSEntry, isLoading, isDeleting } = useCOGSEntries();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Загрузка...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>История себестоимости</CardTitle>
      </CardHeader>
      <CardContent>
        {cogsEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Записи не найдены. Добавьте первую запись.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Период</TableHead>
                  <TableHead>Предмет</TableHead>
                  <TableHead>Себестоимость</TableHead>
                  <TableHead>Маркетплейс</TableHead>
                  <TableHead>Артикул поставщика</TableHead>
                  <TableHead>Артикул МП</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cogsEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.date_from).toLocaleDateString('ru-RU')} - {new Date(entry.date_to).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>{entry.subject || '—'}</TableCell>
                    <TableCell className="font-medium">
                      {Number(entry.unit_cost).toLocaleString('ru-RU')} ₽
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {MARKETPLACE_LABELS[entry.marketplace as keyof typeof MARKETPLACE_LABELS] || entry.marketplace}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.supplier_article || '—'}</TableCell>
                    <TableCell>{entry.marketplace_article || '—'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCOGSEntry(entry.id!)}
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