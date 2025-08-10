import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { useABCAnalysis } from '@/hooks/useABCAnalysis';
import { ABCFilters } from './abc-analysis/ABCFilters';
import { ABCKeyMetrics } from './abc-analysis/ABCKeyMetrics';
import { ABCParetoChart } from './abc-analysis/ABCParetoChart';
import { ABCExpandableTable } from './abc-analysis/ABCExpandableTable';
import { ABCDynamicSplit } from './abc-analysis/ABCDynamicSplit';
import { EmptyStateCard } from './abc-analysis/EmptyStateCard';

export const ABCAnalysis = () => {
  const [analysisType, setAnalysisType] = useState<'sales_volume' | 'revenue' | 'profit'>('revenue');
  const [marketplaceFilter, setMarketplaceFilter] = useState<string[]>(['wildberries', 'ozon']);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  
  const { abcItems, categorySummary, totals, isLoading } = useABCAnalysis(analysisType, marketplaceFilter);

  const handleMarketplaceToggle = (marketplace: string) => {
    setMarketplaceFilter(prev => 
      prev.includes(marketplace) 
        ? prev.filter(m => m !== marketplace)
        : [...prev, marketplace]
    );
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting ABC analysis...');
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
            <h2 className="text-2xl font-bold">ABC Анализ</h2>
            <p className="text-muted-foreground">Категоризация записей продаж по объемам продаж, выручке и прибыли</p>
          </div>
        </div>
        <EmptyStateCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ABC Анализ</h2>
          <p className="text-muted-foreground">Категоризация записей продаж по объемам продаж, выручке и прибыли</p>
        </div>
        <Button onClick={handleExport} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Экспорт анализа</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <ABCKeyMetrics 
        categorySummary={categorySummary}
        analysisType={analysisType}
        totals={totals}
      />

      <div className="space-y-6">
        {/* Filters above Pareto chart */}
        <ABCFilters
          marketplaceFilter={marketplaceFilter}
          onMarketplaceToggle={handleMarketplaceToggle}
          analysisType={analysisType}
          onAnalysisTypeChange={setAnalysisType}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {/* Pareto Chart */}
        <ABCParetoChart 
          abcItems={abcItems}
          analysisType={analysisType}
        />

        {/* Expandable Table */}
        <ABCExpandableTable 
          abcItems={abcItems}
          analysisType={analysisType}
        />

        {/* Dynamic Split */}
        <ABCDynamicSplit 
          abcItems={abcItems}
          analysisType={analysisType}
        />
      </div>
    </div>
  );
};
