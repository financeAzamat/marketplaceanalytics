
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCostData } from '@/hooks/useCostData';

export const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { costs, uploadCostFile, isLoading: costLoading } = useCostData();
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'costs' | 'cogs') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        title: "Неверный формат файла",
        description: "Пожалуйста, загрузите файл Excel (.xlsx или .xls)",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      if (fileType === 'costs') {
        await uploadCostFile(file);
        toast({
          title: "Файл затрат загружен",
          description: "Данные о затратах успешно обработаны",
        });
      } else {
        // Handle COGS file upload (mock for now)
        toast({
          title: "Файл себестоимости загружен",
          description: "Данные о себестоимости успешно обработаны",
        });
      }
    } catch (error: any) {
      toast({
        title: "Ошибка загрузки",
        description: error.message || "Не удалось загрузить файл",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const downloadTemplate = (templateType: 'costs' | 'cogs') => {
    let csvContent = '';
    let fileName = '';

    if (templateType === 'costs') {
      csvContent = '\uFEFF' + [
        'Дата,Категория,Описание,Сумма,Маркетплейс,Тип затрат',
        '2024-01-15,Реклама и маркетинг,Яндекс Директ,15000,Wildberries,Операционные',
        '2024-01-16,Упаковка и логистика,Доставка товаров,8500,Ozon,Логистические',
        '2024-01-17,Сырье и материалы,Пакеты и коробки,3200,Wildberries,Материальные'
      ].join('\n');
      fileName = 'template_costs.csv';
    } else {
      csvContent = '\uFEFF' + [
        'Дата,Название товара,Описание,Себестоимость единицы,Количество,Общая сумма',
        '2024-01-15,Товар А,Закупка сырья,125.00,200,25000.00',
        '2024-01-16,Товар Б,Производство,90.00,200,18000.00',
        '2024-01-17,Товар В,Упаковка и маркировка,50.00,150,7500.00'
      ].join('\n');
      fileName = 'template_cogs.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Шаблон скачан",
      description: "Заполните шаблон и загрузите обратно",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Загрузка файлов</TabsTrigger>
          <TabsTrigger value="history">История загрузок</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Затраты */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Затраты</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Загрузите Excel файл с данными о затратах
                    </p>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadTemplate('costs')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Скачать шаблон затрат
                      </Button>
                      <Button
                        variant="outline"
                        disabled={uploading}
                        onClick={() => document.getElementById('costs-file-upload')?.click()}
                      >
                        {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Загрузить файл затрат
                      </Button>
                      <input
                        id="costs-file-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleFileUpload(e, 'costs')}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Себестоимость */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Себестоимость</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Загрузите Excel файл с данными о себестоимости
                    </p>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadTemplate('cogs')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Скачать шаблон себестоимости
                      </Button>
                      <Button
                        variant="outline"
                        disabled={uploading}
                        onClick={() => document.getElementById('cogs-file-upload')?.click()}
                      >
                        {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Загрузить файл себестоимости
                      </Button>
                      <input
                        id="cogs-file-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleFileUpload(e, 'cogs')}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>История загрузок</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {costLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : costs.length > 0 ? (
                <div className="space-y-3">
                  {costs.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.file_name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(item.upload_date).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{Number(item.total_amount).toLocaleString('ru-RU')} ₽</p>
                        <Badge variant={item.status === 'processed' ? 'default' : 'secondary'}>
                          {item.status === 'processed' ? 'Обработан' : 'В обработке'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Файлы еще не загружены</p>
                  <p className="text-sm">Загрузите первый файл для начала работы</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
