
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { useExpenseJournal } from '@/hooks/useExpenseJournal';

export const ExpenseTable = () => {
  const { expenses, deleteExpense, isLoading, isDeleting } = useExpenseJournal();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Загрузка...</div>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Журнал расходов</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Расходы не найдены. Добавьте первую запись.
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
                  <TableHead>Налоговый вычет</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {new Date(expense.expense_date).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {expense.description}
                    </TableCell>
                    <TableCell className="font-medium">
                      {Number(expense.amount).toLocaleString('ru-RU')} ₽
                    </TableCell>
                    <TableCell>
                      {expense.marketplace ? (
                        <Badge variant="secondary">{expense.marketplace}</Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.is_tax_deductible ? (
                        <Badge variant="outline" className="text-green-600">
                          Да
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteExpense(expense.id!)}
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
