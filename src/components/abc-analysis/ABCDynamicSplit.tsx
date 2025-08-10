import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Settings, Info, Lightbulb } from 'lucide-react';
import { ABCItem } from '@/hooks/useABCAnalysis';
import { categoryColors } from './constants';

interface ABCDynamicSplitProps {
  abcItems: ABCItem[];
  analysisType: 'sales_volume' | 'revenue' | 'profit';
  onSplitChange?: (thresholdA: number, thresholdB: number) => void;
}

export const ABCDynamicSplit = ({ abcItems, analysisType, onSplitChange }: ABCDynamicSplitProps) => {
  const [thresholdA, setThresholdA] = useState(80);
  const [thresholdB, setThresholdB] = useState(95);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const applyDynamicSplit = () => {
    onSplitChange?.(thresholdA, thresholdB);
    setIsDialogOpen(false);
  };

  const calculateSplit = (threshA: number, threshB: number) => {
    const totalValue = abcItems.reduce((sum, item) => sum + item[analysisType], 0);
    let cumulativeValue = 0;
    let categoryA = 0, categoryB = 0, categoryC = 0;

    abcItems.forEach(item => {
      cumulativeValue += item[analysisType];
      const cumulativePercentage = (cumulativeValue / totalValue) * 100;
      
      if (cumulativePercentage <= threshA) {
        categoryA++;
      } else if (cumulativePercentage <= threshB) {
        categoryB++;
      } else {
        categoryC++;
      }
    });

    return { categoryA, categoryB, categoryC };
  };

  const { categoryA, categoryB, categoryC } = calculateSplit(thresholdA, thresholdB);

  const recommendations = [
    {
      category: 'A',
      title: 'Категория A (Высокая важность)',
      description: 'Требует постоянного мониторинга и точного прогнозирования спроса',
      suggestions: [
        'Ежедневный контроль остатков',
        'Тесное сотрудничество с поставщиками',
        'Быстрое пополнение запасов'
      ]
    },
    {
      category: 'B',
      title: 'Категория B (Средняя важность)',
      description: 'Умеренный контроль с периодическим пересмотром',
      suggestions: [
        'Еженедельный мониторинг',
        'Автоматизированное пополнение',
        'Оптимизация размера заказа'
      ]
    },
    {
      category: 'C',
      title: 'Категория C (Низкая важность)',
      description: 'Минимальный контроль с упором на снижение затрат',
      suggestions: [
        'Месячный контроль остатков',
        'Крупные редкие заказы',
        'Простые методы прогнозирования'
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Управление анализом</span>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Динамическое разделение
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Настройка границ категорий</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Граница категории A: {thresholdA}%
                      </label>
                      <Slider
                        value={[thresholdA]}
                        onValueChange={(value) => setThresholdA(value[0])}
                        max={90}
                        min={50}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Граница категории B: {thresholdB}%
                      </label>
                      <Slider
                        value={[thresholdB]}
                        onValueChange={(value) => setThresholdB(value[0])}
                        max={99}
                        min={thresholdA + 5}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-green-50">
                      <div className="font-semibold" style={{ color: categoryColors.A }}>
                        Категория A
                      </div>
                      <div className="text-2xl font-bold">{categoryA}</div>
                      <div className="text-sm text-muted-foreground">позиций</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-orange-50">
                      <div className="font-semibold" style={{ color: categoryColors.B }}>
                        Категория B
                      </div>
                      <div className="text-2xl font-bold">{categoryB}</div>
                      <div className="text-sm text-muted-foreground">позиций</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-red-50">
                      <div className="font-semibold" style={{ color: categoryColors.C }}>
                        Категория C
                      </div>
                      <div className="text-2xl font-bold">{categoryC}</div>
                      <div className="text-sm text-muted-foreground">позиций</div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={applyDynamicSplit}>
                      Применить
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>Рекомендации по управлению</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.category} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline"
                    style={{ 
                      backgroundColor: categoryColors[rec.category as keyof typeof categoryColors] + '20',
                      borderColor: categoryColors[rec.category as keyof typeof categoryColors],
                      color: categoryColors[rec.category as keyof typeof categoryColors]
                    }}
                  >
                    {rec.title}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
                <ul className="text-sm space-y-1 ml-4">
                  {rec.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-current rounded-full" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
                {rec.category !== 'C' && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};