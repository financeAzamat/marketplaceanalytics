
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { usePaymentJournal } from '@/hooks/usePaymentJournal';

const PAYMENT_METHOD_LABELS = {
  cash: 'Наличные',
  bank_transfer: 'Банковский перевод',
  card: 'Банковская карта',
  electronic: 'Электронные деньги',
};

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

  const totalIncome = payments
    .filter(p => p.payment_type === 'income')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  
  const totalExpense = payments
    .filter(p => p.payment_type === 'expense')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const netCashFlow = totalIncome - totalExpense;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Журнал платежей
          <div className="flex gap-2">
            <Badge variant="outline" className="text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Доходы: {totalIncome.toLocaleString('ru-RU')} ₽
            </Badge>
            <Badge variant="outline" className="text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              Расходы: {totalExpense.toLocaleString('ru-RU')} ₽
            </Badge>
            <Badge variant={netCashFlow >= 0 ? 'default' : 'destructive'}>
              Баланс: {netCashFlow.toLocaleString('ru-RU')} ₽
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Платежи не найдены. Добавьте первую запись.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Способ</TableHead>
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
                    <TableCell>
                      <Badge 
                        variant={payment.payment_type === 'income' ? 'default' : 'secondary'}
                        className={payment.payment_type === 'income' ? 'text-green-600' : 'text-red-600'}
                      >
                        {payment.payment_type === 'income' ? (
                          <>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Доход
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Расход
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.category}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {payment.description}
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className={payment.payment_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {payment.payment_type === 'income' ? '+' : '-'}
                        {Number(payment.amount).toLocaleString('ru-RU')} ₽
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {PAYMENT_METHOD_LABELS[payment.payment_method]}
                      </Badge>
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
