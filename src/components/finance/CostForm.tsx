
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCostData, CostEntry } from '@/hooks/useCostData';

const COST_CATEGORIES = [
  'Реклама и маркетинг',
  'Упаковка и логистика',
  'Сырье и материалы',
  'Производство',
  'Операционные расходы',
  'Прочие затраты',
];

const COST_TYPES = [
  { value: 'operational', label: 'Операционные' },
  { value: 'logistics', label: 'Логистические' },
  { value: 'material', label: 'Материальные' },
  { value: 'other', label: 'Прочие' },
];

export const CostForm = () => {
  const { addCost, isAdding } = useCostData();
  const [formData, setFormData] = useState<CostEntry>({
    cost_date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: 0,
    marketplace: '',
    cost_type: 'operational',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.description || formData.amount <= 0) return;
    
    addCost(formData);
    setFormData({
      cost_date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      amount: 0,
      marketplace: '',
      cost_type: 'operational',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить затрату</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost_date">Дата затраты</Label>
              <Input
                id="cost_date"
                type="date"
                value={formData.cost_date}
                onChange={(e) => setFormData({ ...formData, cost_date: e.target.value })}
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
                {COST_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cost_type">Тип затраты</Label>
            <Select
              value={formData.cost_type}
              onValueChange={(value: 'operational' | 'logistics' | 'material' | 'other') => 
                setFormData({ ...formData, cost_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {COST_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
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
              placeholder="Описание затраты"
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

          <Button type="submit" disabled={isAdding} className="w-full">
            {isAdding ? 'Добавление...' : 'Добавить затрату'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
