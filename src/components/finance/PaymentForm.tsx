
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePaymentJournal, PaymentEntry } from '@/hooks/usePaymentJournal';

const PAYMENT_CATEGORIES = {
  income: [
    'Продажи на маркетплейсах',
    'Возвраты и компенсации',
    'Прочие доходы',
  ],
  expense: [
    'Закупка товаров',
    'Реклама и продвижение',
    'Логистика и доставка',
    'Комиссии и платежи',
    'Налоги',
    'Прочие расходы',
  ],
};

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Наличные' },
  { value: 'bank_transfer', label: 'Банковский перевод' },
  { value: 'card', label: 'Банковская карта' },
  { value: 'electronic', label: 'Электронные деньги' },
];

export const PaymentForm = () => {
  const { addPayment, isAdding } = usePaymentJournal();
  const [formData, setFormData] = useState<PaymentEntry>({
    payment_date: new Date().toISOString().split('T')[0],
    payment_type: 'expense',
    category: '',
    description: '',
    amount: 0,
    payment_method: 'bank_transfer',
    marketplace: '',
    invoice_number: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.description || formData.amount <= 0) return;
    
    addPayment(formData);
    setFormData({
      payment_date: new Date().toISOString().split('T')[0],
      payment_type: 'expense',
      category: '',
      description: '',
      amount: 0,
      payment_method: 'bank_transfer',
      marketplace: '',
      invoice_number: '',
    });
  };

  const availableCategories = PAYMENT_CATEGORIES[formData.payment_type];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить платеж</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_date">Дата платежа</Label>
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

          <div>
            <Label htmlFor="payment_type">Тип платежа</Label>
            <Select
              value={formData.payment_type}
              onValueChange={(value: 'income' | 'expense') => 
                setFormData({ ...formData, payment_type: value, category: '' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Доход</SelectItem>
                <SelectItem value="expense">Расход</SelectItem>
              </SelectContent>
            </Select>
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
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="payment_method">Способ платежа</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value: any) => setFormData({ ...formData, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
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
              placeholder="Описание платежа"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="marketplace">Маркетплейс (опционально)</Label>
              <Select
                value={formData.marketplace || ''}
                onValueChange={(value) => setFormData({ ...formData, marketplace: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите маркетплейс" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Не указан</SelectItem>
                  <SelectItem value="wildberries">Wildberries</SelectItem>
                  <SelectItem value="ozon">Ozon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="invoice_number">Номер счета/инвойса (опционально)</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number || ''}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                placeholder="INV-001"
              />
            </div>
          </div>

          <Button type="submit" disabled={isAdding} className="w-full">
            {isAdding ? 'Добавление...' : 'Добавить платеж'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
