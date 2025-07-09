
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { usePaymentJournal } from '@/hooks/usePaymentJournal';


export const PaymentTable = () => {
  const { payments, deletePayment, isLoading, isDeleting } = usePaymentJournal();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Загрузка...</div>
        </CardContent>
      </Card>
    );
  }

  const totalIncome = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Журнал доходов</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Доходы не найдены. Добавьте первую запись.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Маркетплейс</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.payment_date).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>{payment.category}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {payment.description}
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className="text-green-600">
                        +{Number(payment.amount).toLocaleString('ru-RU')} ₽
                      </span>
                    </TableCell>
                    <TableCell>
                      {payment.marketplace ? (
                        <Badge variant="secondary">{payment.marketplace}</Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePayment(payment.id!)}
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
