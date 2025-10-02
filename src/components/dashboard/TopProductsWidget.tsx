import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Trophy } from "lucide-react";

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
        ) : topProducts.length === 0 ? (
          <div className="text-center text-muted-foreground">Нет данных</div>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {product.marketplace}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm">{product.product_name}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Выручка: {product.total_revenue.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>
                  <div className="text-xs mt-1">
                    <span className="text-green-600 font-medium">
                      Прибыль: {product.total_profit.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};