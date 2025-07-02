
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface COGSEntry {
  id?: string;
  cogs_date: string;
  product_name: string;
  description: string;
  unit_cost: number;
  quantity: number;
  total_amount: number;
}

export const COGSForm = () => {
  const [formData, setFormData] = useState<COGSEntry>({
    cogs_date: new Date().toISOString().split('T')[0],
    product_name: '',
    description: '',
    unit_cost: 0,
    quantity: 0,
    total_amount: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name || !formData.description || formData.unit_cost <= 0 || formData.quantity <= 0) return;
    
    // Mock submission for now
    console.log('COGS entry:', formData);
    
    setFormData({
      cogs_date: new Date().toISOString().split('T')[0],
      product_name: '',
      description: '',
      unit_cost: 0,
      quantity: 0,
      total_amount: 0,
    });
  };

  const updateTotalAmount = (unitCost: number, quantity: number) => {
    const total = unitCost * quantity;
    setFormData(prev => ({ ...prev, total_amount: total }));
  };

  const handleUnitCostChange = (value: number) => {
    setFormData(prev => ({ ...prev, unit_cost: value }));
    updateTotalAmount(value, formData.quantity);
  };

  const handleQuantityChange = (value: number) => {
    setFormData(prev => ({ ...prev, quantity: value }));
    updateTotalAmount(formData.unit_cost, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить себестоимость</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cogs_date">Дата</Label>
              <Input
                id="cogs_date"
                type="date"
                value={formData.cogs_date}
                onChange={(e) => setFormData({ ...formData, cogs_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="product_name">Название товара</Label>
              <Input
                id="product_name"
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="Название товара"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Описание товара или процесса"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="unit_cost">Себестоимость единицы</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_cost || ''}
                onChange={(e) => handleUnitCostChange(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="quantity">Количество</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity || ''}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="total_amount">Общая сумма</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                value={formData.total_amount.toFixed(2)}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Добавить себестоимость
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
