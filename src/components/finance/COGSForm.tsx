
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface COGSEntry {
  id?: string;
  cogs_date: string;
  product_name: string;
  unit_cost: number;
  marketplace: string;
  brand: string;
  subject: string;
  size: string;
  supplier_article: string;
  marketplace_article: string;
  barcode: string;
}

const MARKETPLACES = [
  { value: 'wb', label: 'WB' },
  { value: 'ozon', label: 'Ozon' },
];

export const COGSForm = () => {
  const [formData, setFormData] = useState<COGSEntry>({
    cogs_date: new Date().toISOString().split('T')[0],
    product_name: '',
    unit_cost: 0,
    marketplace: '',
    brand: '',
    subject: '',
    size: '',
    supplier_article: '',
    marketplace_article: '',
    barcode: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name || formData.unit_cost <= 0 || !formData.marketplace) return;
    
    // Mock submission for now
    console.log('COGS entry:', formData);
    
    setFormData({
      cogs_date: new Date().toISOString().split('T')[0],
      product_name: '',
      unit_cost: 0,
      marketplace: '',
      brand: '',
      subject: '',
      size: '',
      supplier_article: '',
      marketplace_article: '',
      barcode: '',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить себестоимость</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
              Основная информация
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cogs_date">Дата</Label>
                <Input
                  id="cogs_date"
                  type="date"
                  value={formData.cogs_date}
                  onChange={(e) => setFormData({ ...formData, cogs_date: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="unit_cost">Себестоимость единицы</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_cost || ''}
                  onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                  required
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="marketplace">Маркетплейс</Label>
                <Select
                  value={formData.marketplace}
                  onValueChange={(value) => setFormData({ ...formData, marketplace: value })}
                >
                  <SelectTrigger className="h-10">
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
          </div>

          {/* Информация о товаре */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
              Информация о товаре
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_name">Название товара</Label>
                <Input
                  id="product_name"
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="Название товара"
                  required
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="brand">Бренд</Label>
                <Input
                  id="brand"
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Бренд товара"
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Предмет</Label>
                <Input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Предмет"
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="size">Размер</Label>
                <Input
                  id="size"
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="Размер"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Артикулы и идентификаторы */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
              Артикулы и идентификаторы
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier_article">Артикул поставщика</Label>
                <Input
                  id="supplier_article"
                  type="text"
                  value={formData.supplier_article}
                  onChange={(e) => setFormData({ ...formData, supplier_article: e.target.value })}
                  placeholder="Артикул поставщика"
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="marketplace_article">Артикул маркетплейса</Label>
                <Input
                  id="marketplace_article"
                  type="text"
                  value={formData.marketplace_article}
                  onChange={(e) => setFormData({ ...formData, marketplace_article: e.target.value })}
                  placeholder="Артикул маркетплейса"
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="barcode">Баркод</Label>
                <Input
                  id="barcode"
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Баркод"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-11">
            Добавить себестоимость
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
