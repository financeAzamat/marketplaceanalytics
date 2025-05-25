
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { useABCAnalysis } from '@/hooks/useABCAnalysis';
import { MarketplaceFilter } from './abc-analysis/MarketplaceFilter';
import { CategorySummaryCards } from './abc-analysis/CategorySummaryCards';
import { ABCCharts } from './abc-analysis/ABCCharts';
import { ABCDataTable } from './abc-analysis/ABCDataTable';
import { EmptyStateCard } from './abc-analysis/EmptyStateCard';

export const ABCAnalysis = () => {
  const [analysisType, setAnalysisType] = useState<'sales_volume' | 'revenue' | 'profit'>('revenue');
  const [marketplaceFilter, setMarketplaceFilter] = useState<string[]>(['WB', 'Ozon']);
  
  const { abcItems, categorySummary, totals, isLoading } = useABCAnalysis(analysisType, marketplaceFilter);

  const handleMarketplaceToggle = (marketplace: string) => {
    setMarketplaceFilter(prev => 
      prev.includes(marketplace) 
        ? prev.filter(m => m !== marketplace)
        : [...prev, marketplace]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Загрузка ABC анализа...</span>
      </div>
    );
  }

  if (abcItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">ABC Анализ</h2>
            <p className="text-gray-600">Категоризация записей продаж по объемам продаж, выручке и прибыли</p>
          </div>
        </div>
        <EmptyStateCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ABC Анализ</h2>
          <p className="text-gray-600">Категоризация записей продаж по объемам продаж, выручке и прибыли</p>
        </div>
        <Button>
          Экспорт анализа
        </Button>
      </div>

      <MarketplaceFilter 
        marketplaceFilter={marketplaceFilter}
        onMarketplaceToggle={handleMarketplaceToggle}
      />

      <Tabs value={analysisType} onValueChange={(value) => setAnalysisType(value as typeof analysisType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales_volume" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>По объему продаж</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>По выручке</span>
          </TabsTrigger>
          <TabsTrigger value="profit" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>По прибыли</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={analysisType} className="space-y-6">
          <CategorySummaryCards 
            categorySummary={categorySummary}
            analysisType={analysisType}
          />
          
          <ABCCharts 
            categorySummary={categorySummary}
            abcItems={abcItems}
            analysisType={analysisType}
          />
          
          <ABCDataTable 
            abcItems={abcItems}
            totals={totals}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
