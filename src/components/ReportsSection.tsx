import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  Calendar as CalendarIcon,
  Filter,
  Upload,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const reportTypes = [
  { id: "sales", name: "Отчёт по продажам", description: "Детальная информация о продажах" },
  { id: "profit", name: "Отчёт по прибыли", description: "Анализ прибыльности товаров" },
  { id: "commission", name: "Отчёт по комиссиям", description: "Расчёт комиссий маркетплейсов" },
  { id: "costs", name: "Отчёт по расходам", description: "Анализ всех расходов" },
];

const existingReports = [
  { id: 1, name: "Продажи за октябрь 2024", type: "Продажи", date: "2024-11-01", status: "Готов" },
  { id: 2, name: "Прибыль Q3 2024", type: "Прибыль", date: "2024-10-31", status: "Готов" },
  { id: 3, name: "Комиссии WB октябрь", type: "Комиссии", date: "2024-10-30", status: "Готов" },
];

export const ReportsSection = () => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedType, setSelectedType] = useState("");
  const [selectedMarketplace, setSelectedMarketplace] = useState("");

  return (
    <div className="space-y-6">
      {/* Generate New Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Создать новый отчёт</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => (
              <Card 
                key={type.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedType === type.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm">{type.name}</h3>
                  <p className="text-xs text-slate-600 mt-1">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Маркетплейс</Label>
              <Select value={selectedMarketplace} onValueChange={setSelectedMarketplace}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="wb">Wildberries</SelectItem>
                  <SelectItem value="ozon">Ozon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Дата от</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd.MM.yyyy", { locale: ru }) : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Дата до</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd.MM.yyyy", { locale: ru }) : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={!selectedType || !selectedMarketplace || !dateFrom || !dateTo}
              >
                <Download className="mr-2 h-4 w-4" />
                Создать отчёт
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Cost Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Загрузка данных о себестоимости</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600">
                  Перетащите Excel файл сюда или нажмите для выбора
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Поддерживаются форматы: .xlsx, .xls
                </p>
              </div>
              <Button className="w-full" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Выбрать файл
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Требования к файлу:</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Колонка "Артикул" - артикул товара</li>
                <li>• Колонка "Себестоимость" - стоимость в рублях</li>
                <li>• Колонка "Расходы" - дополнительные расходы</li>
                <li>• Первая строка должна содержать заголовки</li>
              </ul>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-3 w-3" />
                Скачать шаблон
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Готовые отчёты</span>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Фильтр
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {existingReports.map((report) => (
              <div 
                key={report.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {report.type}
                      </Badge>
                      <span className="text-xs text-slate-500">{report.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    {report.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Просмотр
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Скачать
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
