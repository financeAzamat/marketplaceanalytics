
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, Download, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RawApiData {
  marketplace: 'wildberries' | 'ozon';
  timestamp: string;
  data: any;
  processedRecords: number;
}

export const RawDataViewer = () => {
  const { toast } = useToast();
  const [rawData, setRawData] = useState<RawApiData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);

  const fetchRawData = async (marketplace: 'wildberries' | 'ozon') => {
    setIsLoading(true);
    console.log(`Fetching raw data from ${marketplace} API...`);
    
    try {
      // For demo purposes, generate mock data since we removed authentication
      let apiResponse = null;
      
      if (marketplace === 'wildberries') {
        apiResponse = await fetchWildberriesRawData();
      } else if (marketplace === 'ozon') {
        apiResponse = await fetchOzonRawData();
      }

      const newRawData: RawApiData = {
        marketplace,
        timestamp: new Date().toISOString(),
        data: apiResponse,
        processedRecords: Array.isArray(apiResponse) ? apiResponse.length : apiResponse?.result?.data?.length || 0,
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

// Mock functions that return sample data structure
async function fetchWildberriesRawData() {
  console.log('Fetching demo data from Wildberries API...');
  
  // Return mock data structure similar to real Wildberries API
  return [
    {
      date: "2024-01-25",
      rr_dt: "2024-01-25T10:00:00Z",
      retail_amount: 1500.50,
      ppvz_for_pay: 1200.40,
      supplier_reward: 300.10,
      quantity: 2,
      subject: "Товар 1",
      brand: "Бренд 1",
      category: "Категория 1",
      supplierArticle: "ART001",
      techSize: "M",
      barcode: "1234567890123",
      totalPrice: 1500.50,
      discountPercent: 10,
      isSupply: true,
      isRealization: false,
      promoCodeDiscount: 50,
      warehouseName: "Склад Москва",
      countryName: "Россия",
      oblastOkrugName: "Московская область",
      regionName: "Москва",
      incomeID: 12345,
      isReturn: false,
      saleID: "S12345",
      odid: 67890,
      spp: 15.5,
      forPay: 1200.40,
      finishedPrice: 1350.45,
      priceWithDisc: 1350.45,
      nm_id: 98765,
      office_name: "Офис продаж Москва",
      supplier_oper_name: "Операция продажи",
      order_dt: "2024-01-25T08:00:00Z",
      sale_dt: "2024-01-25T10:00:00Z",
      shk_id: 11111,
      retail_price: 1500,
      retail_amount_with_discount: 1350.45,
      sale_percent: 20,
      commission_percent: 15,
      customer_reward: 15.50,
      acquiring_fee: 25.75,
      acquiring_percent: 1.8,
      acquiring_bank: "Банк-эквайер",
      currency_name: "RUB",
      penalty: 0,
      additional_payment: 0,
      rebill_logistic_cost: 0,
      rebill_logistic_org: "",
      kiz: "",
      storage_fee: 12.30,
      deduction: 0,
      acceptance: 0,
      report_type: 1
    },
    {
      date: "2024-01-26",
      rr_dt: "2024-01-26T15:30:00Z",
      retail_amount: 2200.75,
      ppvz_for_pay: 1800.60,
      supplier_reward: 400.15,
      quantity: 1,
      subject: "Товар 2",
      brand: "Бренд 2",
      category: "Категория 2",
      supplierArticle: "ART002",
      techSize: "L",
      barcode: "1234567890124",
      totalPrice: 2200.75,
      discountPercent: 15,
      isSupply: true,
      isRealization: false,
      promoCodeDiscount: 100,
      warehouseName: "Склад СПб",
      countryName: "Россия",
      oblastOkrugName: "Ленинградская область",
      regionName: "Санкт-Петербург",
      incomeID: 12346,
      isReturn: false,
      saleID: "S12346",
      odid: 67891,
      spp: 18.2,
      forPay: 1800.60,
      finishedPrice: 1970.64,
      priceWithDisc: 1970.64,
      nm_id: 98766,
      office_name: "Офис продаж СПб",
      supplier_oper_name: "Операция продажи",
      order_dt: "2024-01-26T12:00:00Z",
      sale_dt: "2024-01-26T15:30:00Z",
      shk_id: 11112,
      retail_price: 2200,
      retail_amount_with_discount: 1970.64,
      sale_percent: 25,
      commission_percent: 18,
      customer_reward: 22.10,
      acquiring_fee: 35.40,
      acquiring_percent: 1.8,
      acquiring_bank: "Банк-эквайер",
      currency_name: "RUB",
      penalty: 0,
      additional_payment: 0,
      rebill_logistic_cost: 0,
      rebill_logistic_org: "",
      kiz: "",
      storage_fee: 18.45,
      deduction: 0,
      acceptance: 0,
      report_type: 1
    }
  ];
}

async function fetchOzonRawData() {
  console.log('Fetching demo data from Ozon API...');
  
  // Return mock data structure similar to real Ozon API
  return {
    result: {
      data: [
        {
          dimensions: [
            { id: "day", value: "2024-01-25" },
            { id: "sku", value: 123456789 },
            { id: "spu", value: 987654321 }
          ],
          metrics: [
            { key: "revenue", value: 2500.75 },
            { key: "ordered_units", value: 5 },
            { key: "returns", value: 1 },
            { key: "cancellations", value: 0 },
            { key: "delivered_units", value: 4 },
            { key: "delivery_charges", value: 150.00 },
            { key: "return_rate", value: 0.2 },
            { key: "avg_price", value: 500.15 },
            { key: "avg_rating", value: 4.5 },
            { key: "reviews_count", value: 12 },
            { key: "commission", value: 375.11 },
            { key: "acquiring", value: 45.01 },
            { key: "fulfillment", value: 125.00 },
            { key: "last_mile", value: 80.00 },
            { key: "processing", value: 25.00 },
            { key: "net_revenue", value: 1849.63 }
          ]
        },
        {
          dimensions: [
            { id: "day", value: "2024-01-26" },
            { id: "sku", value: 123456790 },
            { id: "spu", value: 987654322 }
          ],
          metrics: [
            { key: "revenue", value: 3200.50 },
            { key: "ordered_units", value: 8 },
            { key: "returns", value: 2 },
            { key: "cancellations", value: 1 },
            { key: "delivered_units", value: 6 },
            { key: "delivery_charges", value: 240.00 },
            { key: "return_rate", value: 0.25 },
            { key: "avg_price", value: 400.06 },
            { key: "avg_rating", value: 4.2 },
            { key: "reviews_count", value: 18 },
            { key: "commission", value: 480.08 },
            { key: "acquiring", value: 57.61 },
            { key: "fulfillment", value: 200.00 },
            { key: "last_mile", value: 128.00 },
            { key: "processing", value: 40.00 },
            { key: "net_revenue", value: 2294.81 }
          ]
        }
      ],
      totals: {
        revenue: 5701.25,
        ordered_units: 13,
        returns: 3,
        cancellations: 1,
        delivered_units: 10
      }
    }
  };
}
