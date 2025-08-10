import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { MARKETPLACES } from './constants';

interface ABCFiltersProps {
  marketplaceFilter: string[];
  onMarketplaceToggle: (marketplace: string) => void;
  analysisType: 'sales_volume' | 'revenue' | 'profit';
  onAnalysisTypeChange: (type: 'sales_volume' | 'revenue' | 'profit') => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export const ABCFilters = ({
  marketplaceFilter,
  onMarketplaceToggle,
  analysisType,
  onAnalysisTypeChange,
  dateRange,
  onDateRangeChange
}: ABCFiltersProps) => {
  const [isDateOpen, setIsDateOpen] = useState(false);

  const getMarketplaceName = (code: string) => {
    switch (code) {
      case 'wildberries':
        return 'Wildberries';
      case 'ozon':
        return 'Ozon';
      default:
        return code;
    }
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Фильтры</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Период */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Период</label>
          <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd MMM", { locale: ru })} -{" "}
                      {format(dateRange.to, "dd MMM yyyy", { locale: ru })}
                    </>
                  ) : (
                    format(dateRange.from, "dd MMM yyyy", { locale: ru })
                  )
                ) : (
                  <span>Выберите период</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  onDateRangeChange({
                    from: range?.from,
                    to: range?.to
                  });
                  if (range?.from && range?.to) {
                    setIsDateOpen(false);
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Маркетплейсы */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Маркетплейсы</label>
          <div className="space-y-2">
            {MARKETPLACES.map(marketplace => (
              <div key={marketplace} className="flex items-center space-x-2">
                <Checkbox
                  id={marketplace}
                  checked={marketplaceFilter.includes(marketplace)}
                  onCheckedChange={() => onMarketplaceToggle(marketplace)}
                />
                <label htmlFor={marketplace} className="text-sm">
                  {getMarketplaceName(marketplace)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Метрика анализа */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Метрика анализа</label>
          <Select value={analysisType} onValueChange={onAnalysisTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Выручка</SelectItem>
              <SelectItem value="sales_volume">Объем продаж</SelectItem>
              <SelectItem value="profit">Прибыль</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};