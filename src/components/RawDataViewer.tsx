
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, Download, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RawApiData {
  marketplace: 'wildberries' | 'ozon';
  timestamp: string;
  data: any;
  processedRecords: number;
}

export const RawDataViewer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rawData, setRawData] = useState<RawApiData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);

  const fetchRawData = async (marketplace: 'wildberries' | 'ozon') => {
    if (!user?.id) return;
    
    setIsLoading(true);
    console.log(`Fetching raw data from ${marketplace} API...`);
    
    try {
      // Get connection details
      const { data: connection, error: connectionError } = await supabase
        .from('marketplace_connections')
        .select('access_token, refresh_token')
        .eq('user_id', user.id)
        .eq('marketplace', marketplace)
        .single();

      if (connectionError || !connection?.access_token) {
        throw new Error('API ключи не найдены или недействительны');
      }

      let apiResponse = null;
      
      if (marketplace === 'wildberries') {
        apiResponse = await fetchWildberriesRawData(connection.access_token);
      } else if (marketplace === 'ozon') {
        apiResponse = await fetchOzonRawData(connection.access_token, connection.refresh_token);
      }

      const newRawData: RawApiData = {
        marketplace,
        timestamp: new Date().toISOString(),
        data: apiResponse,
        processedRecords: Array.isArray(apiResponse) ? apiResponse.length : 0,
      };

      setRawData(prev => [newRawData, ...prev]);
      
      toast({
        title: "Данные получены",
        description: `Получено ${newRawData.processedRecords} записей из ${marketplace}`,
      });

    } catch (error: any) {
      console.error('Error fetching raw data:', error);
      toast({
        title: "Ошибка получения данных",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const viewJsonData = (data: any) => {
    setSelectedData(data);
  };

  const downloadJson = (data: any, marketplace: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${marketplace}_raw_data_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Сырые данные API маркетплейсов</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button 
              onClick={() => fetchRawData('wildberries')}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Получить данные Wildberries
            </Button>
            <Button 
              onClick={() => fetchRawData('ozon')}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Получить данные Ozon
            </Button>
          </div>

          {rawData.length > 0 && (
            <Tabs defaultValue="table" className="space-y-4">
              <TabsList>
                <TabsTrigger value="table">Таблица</TabsTrigger>
                <TabsTrigger value="json">JSON просмотр</TabsTrigger>
              </TabsList>

              <TabsContent value="table" className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Маркетплейс</TableHead>
                      <TableHead>Время получения</TableHead>
                      <TableHead>Записей</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="outline">{item.marketplace}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(item.timestamp).toLocaleString('ru-RU')}
                        </TableCell>
                        <TableCell>{item.processedRecords}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewJsonData(item.data)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Просмотр
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadJson(item.data, item.marketplace)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Скачать
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="json">
                {selectedData ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>JSON данные</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96 w-full border rounded p-4">
                        <pre className="text-sm">
                          {JSON.stringify(selectedData, null, 2)}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-500">Выберите элемент из таблицы для просмотра JSON</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}

          {rawData.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Нажмите кнопку выше для получения сырых данных из API</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Функции для получения сырых данных (копируем из useDataSync)
async function fetchWildberriesRawData(apiKey: string) {
  console.log('Fetching raw data from Wildberries API...');
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  
  try {
    const response = await fetch(`https://statistics-api.wildberries.ru/api/v1/supplier/reportDetailByPeriod?dateFrom=${startDate.toISOString().split('T')[0]}&dateTo=${endDate.toISOString().split('T')[0]}`, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Wildberries API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw Wildberries API response:', data);
    return data;
  } catch (error) {
    console.error('Wildberries API fetch error:', error);
    // Возвращаем пример структуры данных для демонстрации
    return {
      error: error.message,
      mock_data_structure: [
        {
          date: "2024-01-25",
          rr_dt: "2024-01-25T10:00:00Z",
          retail_amount: 1500.50,
          ppvz_for_pay: 1200.40,
          supplier_reward: 300.10,
          quantity: 2,
          subject: "Товар 1",
          brand: "Бренд 1",
          category: "Категория 1"
        }
      ]
    };
  }
}

async function fetchOzonRawData(apiKey: string, clientId: string) {
  console.log('Fetching raw data from Ozon API...');
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  
  try {
    const response = await fetch('https://api-seller.ozon.ru/v3/analytics/data', {
      method: 'POST',
      headers: {
        'Client-Id': clientId || apiKey,
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date_from: startDate.toISOString().split('T')[0],
        date_to: endDate.toISOString().split('T')[0],
        metrics: ['revenue', 'ordered_units', 'returns'],
        dimension: ['day'],
        filters: [],
      }),
    });

    if (!response.ok) {
      throw new Error(`Ozon API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw Ozon API response:', data);
    return data;
  } catch (error) {
    console.error('Ozon API fetch error:', error);
    // Возвращаем пример структуры данных для демонстрации
    return {
      error: error.message,
      mock_data_structure: {
        result: {
          data: [
            {
              dimensions: [
                { id: "day", value: "2024-01-25" }
              ],
              metrics: [
                { key: "revenue", value: 2500.75 },
                { key: "ordered_units", value: 5 },
                { key: "returns", value: 1 }
              ]
            }
          ]
        }
      }
    };
  }
}
