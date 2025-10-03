import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";

interface TopProduct {
  product_name: string;
  total_revenue: number;
  total_profit: number;
  marketplace: string;
}

interface TopProductsWidgetProps {
  topProducts: TopProduct[];
  isLoading: boolean;
}

export const TopProductsWidget = ({ topProducts, isLoading }: TopProductsWidgetProps) => {
  const exampleProducts: TopProduct[] = [
    { product_name: "Футболка базовая хлопок", total_revenue: 145000, total_profit: 58000, marketplace: "Wildberries" },
    { product_name: "Джинсы классические", total_revenue: 128000, total_profit: 51200, marketplace: "OZON" },
    { product_name: "Кроссовки спортивные", total_revenue: 112000, total_profit: 44800, marketplace: "Wildberries" },
    { product_name: "Рюкзак городской", total_revenue: 98000, total_profit: 39200, marketplace: "OZON" },
    { product_name: "Свитшот оверсайз", total_revenue: 87000, total_profit: 34800, marketplace: "Wildberries" },
  ];

  const displayProducts = topProducts.length > 0 ? topProducts : exampleProducts;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5" />
          <span>ТОП 5 товаров</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground">Загрузка...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Наименование товара</TableHead>
                <TableHead className="text-right">Выручка</TableHead>
                <TableHead className="text-right">Прибыль</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayProducts.map((product, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{product.product_name}</TableCell>
                  <TableCell className="text-right">{product.total_revenue.toLocaleString('ru-RU')} ₽</TableCell>
                  <TableCell className="text-right text-green-600">{product.total_profit.toLocaleString('ru-RU')} ₽</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};