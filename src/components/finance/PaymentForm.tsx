
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePaymentJournal, PaymentEntry } from '@/hooks/usePaymentJournal';

const INCOME_CATEGORIES = [
  'Продажи на маркетплейсах',
  'Возвраты и компенсации',
  'Прочие доходы',
];

const MARKETPLACES = [
  { value: 'wildberries', label: 'Wildberries' },
  { value: 'ozon', label: 'Ozon' },
  { value: 'other', label: 'Прочее' },
];

export const PaymentForm = () => {
  const { addPayment, isAdding } = usePaymentJournal();
  const [formData, setFormData] = useState<PaymentEntry>({
    payment_date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: 0,
    marketplace: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.description || formData.amount <= 0 || !formData.marketplace) return;
    
    addPayment(formData);
    setFormData({
      payment_date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      amount: 0,
      marketplace: '',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить доход</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_date">Дата дохода</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {INCOME_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="marketplace">Маркетплейс *</Label>
              <Select
                value={formData.marketplace}
                onValueChange={(value) => setFormData({ ...formData, marketplace: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите маркетплейс" />
                </SelectTrigger>
                <SelectContent>
                  {MARKETPLACES.map((marketplace) => (
                    <SelectItem key={marketplace.value} value={marketplace.value}>
                      {marketplace.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Описание дохода"
              required
            />
          </div>

          <Button type="submit" disabled={isAdding} className="w-full">
            {isAdding ? 'Добавление...' : 'Добавить доход'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
