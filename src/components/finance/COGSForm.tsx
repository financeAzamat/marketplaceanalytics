
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCOGSEntries } from '@/hooks/useCOGSEntries';

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
  const { addCOGSEntry, isAdding } = useCOGSEntries();
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
    
    addCOGSEntry(formData);
    
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Информация о товаре */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
              Информация о товаре
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_name">Название товара</Label>
                <Select
                  value={formData.product_name}
                  onValueChange={(value) => setFormData({ ...formData, product_name: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Выберите товар" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Футболка базовая">Футболка базовая</SelectItem>
                    <SelectItem value="Джинсы классические">Джинсы классические</SelectItem>
                    <SelectItem value="Кроссовки спортивные">Кроссовки спортивные</SelectItem>
                    <SelectItem value="Платье летнее">Платье летнее</SelectItem>
                    <SelectItem value="Куртка демисезонная">Куртка демисезонная</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="brand">Бренд</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) => setFormData({ ...formData, brand: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Выберите бренд" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nike">Nike</SelectItem>
                    <SelectItem value="Adidas">Adidas</SelectItem>
                    <SelectItem value="Zara">Zara</SelectItem>
                    <SelectItem value="H&M">H&M</SelectItem>
                    <SelectItem value="Levi's">Levi's</SelectItem>
                    <SelectItem value="Tommy Hilfiger">Tommy Hilfiger</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Предмет</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Одежда">Одежда</SelectItem>
                    <SelectItem value="Обувь">Обувь</SelectItem>
                    <SelectItem value="Аксессуары">Аксессуары</SelectItem>
                    <SelectItem value="Сумки">Сумки</SelectItem>
                    <SelectItem value="Украшения">Украшения</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="size">Размер</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => setFormData({ ...formData, size: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Выберите размер" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                    <SelectItem value="36">36</SelectItem>
                    <SelectItem value="38">38</SelectItem>
                    <SelectItem value="40">40</SelectItem>
                    <SelectItem value="42">42</SelectItem>
                    <SelectItem value="44">44</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select
                  value={formData.supplier_article}
                  onValueChange={(value) => setFormData({ ...formData, supplier_article: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Выберите артикул" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUP001">SUP001</SelectItem>
                    <SelectItem value="SUP002">SUP002</SelectItem>
                    <SelectItem value="SUP003">SUP003</SelectItem>
                    <SelectItem value="SUP004">SUP004</SelectItem>
                    <SelectItem value="SUP005">SUP005</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="marketplace_article">Артикул маркетплейса</Label>
                <Select
                  value={formData.marketplace_article}
                  onValueChange={(value) => setFormData({ ...formData, marketplace_article: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Выберите артикул" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WB123456">WB123456</SelectItem>
                    <SelectItem value="WB789012">WB789012</SelectItem>
                    <SelectItem value="OZ345678">OZ345678</SelectItem>
                    <SelectItem value="OZ901234">OZ901234</SelectItem>
                    <SelectItem value="WB567890">WB567890</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="barcode">Баркод</Label>
                <Select
                  value={formData.barcode}
                  onValueChange={(value) => setFormData({ ...formData, barcode: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Выберите баркод" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1234567890123">1234567890123</SelectItem>
                    <SelectItem value="2345678901234">2345678901234</SelectItem>
                    <SelectItem value="3456789012345">3456789012345</SelectItem>
                    <SelectItem value="4567890123456">4567890123456</SelectItem>
                    <SelectItem value="5678901234567">5678901234567</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isAdding} className="w-full h-11">
            {isAdding ? 'Добавление...' : 'Добавить себестоимость'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
