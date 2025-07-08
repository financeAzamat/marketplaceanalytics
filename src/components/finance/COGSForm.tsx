
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCOGSEntries, COGSEntry } from '@/hooks/useCOGSEntries';


const MARKETPLACES = [
  { value: 'wb', label: 'WB' },
  { value: 'ozon', label: 'Ozon' },
];

export const COGSForm = () => {
  const { addCOGSEntry, isAdding } = useCOGSEntries();
  const [formData, setFormData] = useState<COGSEntry>({
    date_from: new Date().toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
    unit_cost: 0,
    marketplace: '',
    subject: '',
    supplier_article: '',
    marketplace_article: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.unit_cost <= 0 || !formData.marketplace) return;
    
    addCOGSEntry(formData);
    
    setFormData({
      date_from: new Date().toISOString().split('T')[0],
      date_to: new Date().toISOString().split('T')[0],
      unit_cost: 0,
      marketplace: '',
      subject: '',
      supplier_article: '',
      marketplace_article: '',
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
                <Label htmlFor="date_from">Дата с</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={formData.date_from}
                  onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="date_to">Дата по</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={formData.date_to}
                  onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Информация о товаре */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
              Информация о товаре
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
          </div>

          <Button type="submit" disabled={isAdding} className="w-full h-11">
            {isAdding ? 'Добавление...' : 'Добавить себестоимость'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
