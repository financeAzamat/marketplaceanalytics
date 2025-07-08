
import { useState } from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCOGSEntries, COGSEntry } from '@/hooks/useCOGSEntries';
import { cn } from '@/lib/utils';


const MARKETPLACES = [
  { value: 'wb', label: 'WB' },
  { value: 'ozon', label: 'Ozon' },
];

export const COGSForm = () => {
  const { addCOGSEntry, isAdding } = useCOGSEntries();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState<Omit<COGSEntry, 'date_from' | 'date_to'>>({
    unit_cost: 0,
    marketplace: '',
    subject: '',
    supplier_article: '',
    marketplace_article: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.unit_cost <= 0 || !formData.marketplace || !dateRange?.from || !dateRange?.to) return;
    
    const entryData: COGSEntry = {
      ...formData,
      date_from: dateRange.from.toISOString().split('T')[0],
      date_to: dateRange.to.toISOString().split('T')[0],
    };
    
    addCOGSEntry(entryData);
    
    setDateRange(undefined);
    setFormData({
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
            <div className="space-y-4">
              <div>
                <Label>Период действия</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-10 justify-start text-left font-normal",
                        !dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          `${format(dateRange.from, "dd.MM.yyyy")} - ${format(dateRange.to, "dd.MM.yyyy")}`
                        ) : (
                          format(dateRange.from, "dd.MM.yyyy")
                        )
                      ) : (
                        <span>Выберите период</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
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
