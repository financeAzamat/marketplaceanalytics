import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  BarChart3,
  Loader2,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CashFlowReport } from './reports/CashFlowReport';

interface ReportConfig {
  reportType: 'dds' | 'piu';
  marketplace: 'wildberries' | 'ozon' | 'all';
  month: number;
  year: number;
}

export const AdvancedReports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    reportType: 'dds',
    marketplace: 'all',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
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

  const generateReportMutation = useMutation({
    mutationFn: async (config: ReportConfig) => {
      const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                         'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
      const reportName = `${getReportTypeName(config.reportType)} - ${config.marketplace === 'all' ? 'Все маркетплейсы' : config.marketplace} - ${monthNames[config.month - 1]} ${config.year}`;
      
      const dateFrom = new Date(config.year, config.month - 1, 1);
      const dateTo = new Date(config.year, config.month, 0);
      
      // Create report record
      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          report_name: reportName,
          report_type: config.reportType,
          marketplace: config.marketplace,
          date_from: dateFrom.toISOString().split('T')[0],
          date_to: dateTo.toISOString().split('T')[0],
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
      
      return report;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
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
              <label className="text-sm font-medium">Месяц</label>
              <Select
                value={reportConfig.month.toString()}
                onValueChange={(value) => 
                  setReportConfig(prev => ({ ...prev, month: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите месяц" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Январь</SelectItem>
                  <SelectItem value="2">Февраль</SelectItem>
                  <SelectItem value="3">Март</SelectItem>
                  <SelectItem value="4">Апрель</SelectItem>
                  <SelectItem value="5">Май</SelectItem>
                  <SelectItem value="6">Июнь</SelectItem>
                  <SelectItem value="7">Июль</SelectItem>
                  <SelectItem value="8">Август</SelectItem>
                  <SelectItem value="9">Сентябрь</SelectItem>
                  <SelectItem value="10">Октябрь</SelectItem>
                  <SelectItem value="11">Ноябрь</SelectItem>
                  <SelectItem value="12">Декабрь</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Год</label>
              <Select
                value={reportConfig.year.toString()}
                onValueChange={(value) => 
                  setReportConfig(prev => ({ ...prev, year: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите год" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={() => generateReportMutation.mutate(reportConfig)}
            disabled={generateReportMutation.isPending}
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
            month={new Date(selectedReport.date_from).getMonth() + 1}
            year={new Date(selectedReport.date_from).getFullYear()}
            marketplace={selectedReport.marketplace}
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
