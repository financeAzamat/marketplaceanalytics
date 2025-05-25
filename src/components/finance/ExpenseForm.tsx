
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExpenseJournal, ExpenseEntry } from '@/hooks/useExpenseJournal';

const EXPENSE_CATEGORIES = [
  'Реклама и маркетинг',
  'Упаковка и логистика',
  'Комиссии маркетплейсов',
  'Налоги и сборы',
  'Офисные расходы',
  'Прочие расходы',
];

export const ExpenseForm = () => {
  const { addExpense, isAdding } = useExpenseJournal();
  const [formData, setFormData] = useState<ExpenseEntry>({
    expense_date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: 0,
    marketplace: '',
    is_tax_deductible: false,
    receipt_url: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.description || formData.amount <= 0) return;
    
    addExpense(formData);
    setFormData({
      expense_date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      amount: 0,
      marketplace: '',
      is_tax_deductible: false,
      receipt_url: '',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить расход</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expense_date">Дата расхода</Label>
              <Input
                id="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Сумма</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Категория</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Описание расхода"
              required
            />
          </div>

          <div>
            <Label htmlFor="marketplace">Маркетплейс (опционально)</Label>
            <Select
              value={formData.marketplace || 'none'}
              onValueChange={(value) => setFormData({ ...formData, marketplace: value === 'none' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите маркетплейс" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Не указан</SelectItem>
                <SelectItem value="wildberries">Wildberries</SelectItem>
                <SelectItem value="ozon">Ozon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="receipt_url">Ссылка на чек (опционально)</Label>
            <Input
              id="receipt_url"
              type="url"
              value={formData.receipt_url || ''}
              onChange={(e) => setFormData({ ...formData, receipt_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_tax_deductible"
              checked={formData.is_tax_deductible}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, is_tax_deductible: checked as boolean })
              }
            />
            <Label htmlFor="is_tax_deductible">Налоговый вычет</Label>
          </div>

          <Button type="submit" disabled={isAdding} className="w-full">
            {isAdding ? 'Добавление...' : 'Добавить расход'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
