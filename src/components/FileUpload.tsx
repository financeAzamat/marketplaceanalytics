
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCostData } from '@/hooks/useCostData';

export const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { uploadCostFile } = useCostData();
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      await uploadCostFile(file);
      toast({
        title: "Файл загружен",
        description: "Данные о расходах успешно обработаны",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка загрузки",
        description: error.message || "Не удалось загрузить файл",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Загрузка расходов</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Загрузите Excel файл с данными о расходах
            </p>
            <Button
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Выбрать файл
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
