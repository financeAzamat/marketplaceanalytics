import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FileText, 
  Download, 
  BarChart3,
  Loader2,
  Eye,
  CalendarIcon
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths, addYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CashFlowReport } from './reports/CashFlowReport';
import { ProfitLossReport } from './reports/ProfitLossReport';
import { cn } from '@/lib/utils';

interface ReportConfig {
  reportType: 'dds' | 'piu';
  marketplace: 'wildberries' | 'ozon' | 'all';
  dateFrom: Date;
  dateTo: Date;
  periodType: 'week' | 'month' | 'year';
  periods: Array<{
    name: string;
    dateFrom: Date;
    dateTo: Date;
  }>;
}

export const AdvancedReports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    reportType: 'dds',
    marketplace: 'all',
    dateFrom: new Date(),
    dateTo: new Date(),
    periodType: 'month',
    periods: []
  });

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const generatePeriods = (dateFrom: Date, dateTo: Date, periodType: 'week' | 'month' | 'year') => {
    const periods = [];
    let current = new Date(dateFrom);
    
    while (current <= dateTo) {
      let periodStart: Date;
      let periodEnd: Date;
      let periodName: string;
      
      switch (periodType) {
        case 'week':
          periodStart = startOfWeek(current, { weekStartsOn: 1 });
          periodEnd = endOfWeek(current, { weekStartsOn: 1 });
          periodName = `Неделя ${format(periodStart, 'dd.MM')} - ${format(periodEnd, 'dd.MM.yyyy')}`;
          current = addWeeks(current, 1);
          break;
        case 'month':
          periodStart = startOfMonth(current);
          periodEnd = endOfMonth(current);
          periodName = format(current, 'LLLL yyyy', { locale: ru });
          current = addMonths(current, 1);
          break;
        case 'year':
          periodStart = startOfYear(current);
          periodEnd = endOfYear(current);
          periodName = format(current, 'yyyy');
          current = addYears(current, 1);
          break;
      }
      
      periods.push({
        name: periodName,
        dateFrom: periodStart,
        dateTo: periodEnd
      });
      
      if (periodEnd >= dateTo) break;
    }
    
    return periods;
  };

  const generateReportMutation = useMutation({
    mutationFn: async (config: ReportConfig) => {
      const periods = generatePeriods(config.dateFrom, config.dateTo, config.periodType);
      const reportName = `${getReportTypeName(config.reportType)} - ${config.marketplace === 'all' ? 'Все маркетплейсы' : config.marketplace} - ${format(config.dateFrom, 'dd.MM.yyyy')} - ${format(config.dateTo, 'dd.MM.yyyy')}`;
      
      // Create report record
      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          report_name: reportName,
          report_type: config.reportType,
          marketplace: config.marketplace,
          date_from: config.dateFrom.toISOString().split('T')[0],
          date_to: config.dateTo.toISOString().split('T')[0],
          status: 'generating',
        })
        .select()
        .single();

      if (error) throw error;
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update report status
      const { error: updateError } = await supabase
        .from('reports')
        .update({ 
          status: 'generated',
          file_url: `https://example.com/reports/${report.id}.xlsx`
        })
        .eq('id', report.id);

      if (updateError) throw updateError;
      
      return { ...report, periods };
    },
    onSuccess: () => {
      toast({
        title: "Отчет создан",
        description: "Отчет успешно сгенерирован и готов к скачиванию",
      });
      // Принудительно обновляем кэш и перезапрашиваем данные
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.refetchQueries({ queryKey: ['reports'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка создания отчета",
        description: error.message || "Не удалось создать отчет",
        variant: "destructive",
      });
    },
  });

  const handleDownload = async (report: any) => {
    try {
      // Generate sample Excel data
      const csvContent = generateSampleCSV(report);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.report_name}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Файл скачан",
        description: "Отчет успешно скачан на ваше устройство",
      });
    } catch (error) {
      toast({
        title: "Ошибка скачивания",
        description: "Не удалось скачать отчет",
        variant: "destructive",
      });
    }
  };

  const generateSampleCSV = (report: any) => {
    const headers = ['Дата', 'Маркетплейс', 'Продажи', 'Прибыль', 'Заказы'];
    const sampleData = [
      ['25.05.2025', 'Wildberries', '125000', '25000', '45'],
      ['24.05.2025', 'Ozon', '95000', '18000', '32'],
      ['23.05.2025', 'Wildberries', '110000', '22000', '38'],
      ['22.05.2025', 'Ozon', '87000', '16500', '29'],
      ['21.05.2025', 'Wildberries', '132000', '26400', '48'],
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');
    
    return '\uFEFF' + csvContent; // Add BOM for proper UTF-8 encoding
  };

  const getReportTypeName = (type: string) => {
    const names = {
      dds: 'ДДС',
      piu: 'ПиУ',
    };
    return names[type as keyof typeof names] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
      generating: 'secondary',
      generated: 'default',
      error: 'destructive',
    };
    
    const labels = {
      generating: 'Создается',
      generated: 'Готов',
      error: 'Ошибка',
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Создать отчет</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Тип отчета</label>
              <Select
                value={reportConfig.reportType}
                onValueChange={(value: any) => 
                  setReportConfig(prev => ({ ...prev, reportType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dds">ДДС</SelectItem>
                  <SelectItem value="piu">ПиУ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Маркетплейс</label>
              <Select
                value={reportConfig.marketplace}
                onValueChange={(value: any) => 
                  setReportConfig(prev => ({ ...prev, marketplace: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите маркетплейс" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все маркетплейсы</SelectItem>
                  <SelectItem value="wildberries">Wildberries</SelectItem>
                  <SelectItem value="ozon">Ozon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Тип периода</label>
              <Select
                value={reportConfig.periodType}
                onValueChange={(value: any) => 
                  setReportConfig(prev => ({ ...prev, periodType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип периода" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">По неделям</SelectItem>
                  <SelectItem value="month">По месяцам</SelectItem>
                  <SelectItem value="year">По годам</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Дата начала</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !reportConfig.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reportConfig.dateFrom ? format(reportConfig.dateFrom, "dd.MM.yyyy") : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={reportConfig.dateFrom}
                    onSelect={(date) => date && setReportConfig(prev => ({ ...prev, dateFrom: date }))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Дата окончания</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !reportConfig.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reportConfig.dateTo ? format(reportConfig.dateTo, "dd.MM.yyyy") : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={reportConfig.dateTo}
                    onSelect={(date) => date && setReportConfig(prev => ({ ...prev, dateTo: date }))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button 
            onClick={() => {
              const periods = generatePeriods(reportConfig.dateFrom, reportConfig.dateTo, reportConfig.periodType);
              generateReportMutation.mutate({ ...reportConfig, periods });
            }}
            disabled={generateReportMutation.isPending || !reportConfig.dateFrom || !reportConfig.dateTo || reportConfig.dateFrom > reportConfig.dateTo}
            className="w-full md:w-auto"
          >
            {generateReportMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Создать отчет
          </Button>
        </CardContent>
      </Card>

      {/* Отображение выбранного отчета */}
      {selectedReport && selectedReport.report_type === 'dds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Просмотр отчета</h3>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Закрыть
            </Button>
          </div>
          <CashFlowReport 
            reportId={selectedReport.id}
            reportName={selectedReport.report_name}
            dateFrom={new Date(selectedReport.date_from)}
            dateTo={new Date(selectedReport.date_to)}
            marketplace={selectedReport.marketplace}
            periods={generatePeriods(new Date(selectedReport.date_from), new Date(selectedReport.date_to), 'month')}
          />
        </div>
      )}
      
      {selectedReport && selectedReport.report_type === 'piu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Просмотр отчета</h3>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Закрыть
            </Button>
          </div>
          <ProfitLossReport 
            reportId={selectedReport.id}
            reportName={selectedReport.report_name}
            dateFrom={new Date(selectedReport.date_from)}
            dateTo={new Date(selectedReport.date_to)}
            marketplace={selectedReport.marketplace}
            periods={generatePeriods(new Date(selectedReport.date_from), new Date(selectedReport.date_to), 'month')}
          />
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>История отчетов</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{report.report_name}</h3>
                    <p className="text-sm text-gray-500">
                      Создан {format(new Date(report.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(report.status)}
                    {report.status === 'generated' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Посмотреть
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(report)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Скачать
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Отчеты еще не созданы
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
