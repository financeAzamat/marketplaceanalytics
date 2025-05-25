
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  CalendarIcon, 
  TrendingUp, 
  BarChart3,
  PieChart,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ReportConfig {
  reportType: 'sales' | 'profit' | 'commissions' | 'costs';
  marketplace: 'wildberries' | 'ozon' | 'all';
  dateFrom: Date;
  dateTo: Date;
}

export const AdvancedReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    reportType: 'sales',
    marketplace: 'all',
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    dateTo: new Date(),
  });

  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const generateReportMutation = useMutation({
    mutationFn: async (config: ReportConfig) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const reportName = `${getReportTypeName(config.reportType)} - ${config.marketplace === 'all' ? 'Все маркетплейсы' : config.marketplace} - ${format(config.dateFrom, 'dd.MM.yyyy', { locale: ru })}-${format(config.dateTo, 'dd.MM.yyyy', { locale: ru })}`;
      
      // Create report record
      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
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
      
      return report;
    },
    onSuccess: () => {
      toast({
        title: "Отчет создан",
        description: "Отчет успешно сгенерирован и готов к скачиванию",
      });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка создания отчета",
        description: error.message || "Не удалось создать отчет",
        variant: "destructive",
      });
    },
  });

  const getReportTypeName = (type: string) => {
    const names = {
      sales: 'Отчет по продажам',
      profit: 'Отчет по прибыли',
      commissions: 'Отчет по комиссиям',
      costs: 'Отчет по расходам',
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
                  <SelectItem value="sales">Продажи</SelectItem>
                  <SelectItem value="profit">Прибыль</SelectItem>
                  <SelectItem value="commissions">Комиссии</SelectItem>
                  <SelectItem value="costs">Расходы</SelectItem>
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
              <label className="text-sm font-medium">Дата от</label>
              <Popover open={showDateFromPicker} onOpenChange={setShowDateFromPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !reportConfig.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reportConfig.dateFrom ? format(reportConfig.dateFrom, "dd.MM.yyyy", { locale: ru }) : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={reportConfig.dateFrom}
                    onSelect={(date) => {
                      if (date) {
                        setReportConfig(prev => ({ ...prev, dateFrom: date }));
                        setShowDateFromPicker(false);
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Дата до</label>
              <Popover open={showDateToPicker} onOpenChange={setShowDateToPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !reportConfig.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reportConfig.dateTo ? format(reportConfig.dateTo, "dd.MM.yyyy", { locale: ru }) : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={reportConfig.dateTo}
                    onSelect={(date) => {
                      if (date) {
                        setReportConfig(prev => ({ ...prev, dateTo: date }));
                        setShowDateToPicker(false);
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
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
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Скачать
                      </Button>
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
